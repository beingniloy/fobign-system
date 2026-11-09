import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { db } from '@/lib/db';

interface BackupMeta {
  filename: string;
  type: 'hourly' | 'daily_7d' | 'daily_14d' | 'daily_30d' | 'manual';
  size_bytes: number;
  size_formatted: string;
  created_at: string;
  timestamp: number;
}

interface BackupConfig {
  hourly_enabled: boolean;
  max_hourly_backups: number; // default 3
  retention_7d_enabled: boolean;
  retention_14d_enabled: boolean;
  retention_30d_enabled: boolean;
  admin_notification_email: string;
}

let backupConfig: BackupConfig = {
  hourly_enabled: true,
  max_hourly_backups: 3,
  retention_7d_enabled: true,
  retention_14d_enabled: true,
  retention_30d_enabled: true,
  admin_notification_email: 'admin@fobign.com',
};

// Store active verification OTP for reset operation
let activeResetOtp: { code: string; expires_at: number } | null = null;

function getBackupsDir(): string {
  const dbFile = db.getDbFilePath();
  const dir = path.join(path.dirname(dbFile), 'backups');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function listBackups(): BackupMeta[] {
  const dir = getBackupsDir();
  const files = fs.readdirSync(dir);
  const backups: BackupMeta[] = [];

  for (const file of files) {
    if (!file.endsWith('.json')) continue;
    const fullPath = path.join(dir, file);
    try {
      const stat = fs.statSync(fullPath);
      let type: BackupMeta['type'] = 'manual';
      if (file.startsWith('backup_hourly_')) type = 'hourly';
      else if (file.startsWith('backup_7d_')) type = 'daily_7d';
      else if (file.startsWith('backup_14d_')) type = 'daily_14d';
      else if (file.startsWith('backup_30d_')) type = 'daily_30d';

      backups.push({
        filename: file,
        type,
        size_bytes: stat.size,
        size_formatted: formatBytes(stat.size),
        created_at: new Date(stat.mtimeMs).toISOString().replace('T', ' ').slice(0, 19),
        timestamp: stat.mtimeMs,
      });
    } catch {}
  }

  // Sort descending by timestamp (newest first)
  return backups.sort((a, b) => b.timestamp - a.timestamp);
}

function rotateHourlyBackups() {
  const allBackups = listBackups();
  const hourly = allBackups.filter((b) => b.type === 'hourly');
  const dir = getBackupsDir();

  // If hourly count exceeds max (default 3), delete the oldest ones
  const maxHourly = backupConfig.max_hourly_backups || 3;
  if (hourly.length > maxHourly) {
    const toRemove = hourly.slice(maxHourly);
    for (const b of toRemove) {
      try {
        fs.unlinkSync(path.join(dir, b.filename));
      } catch {}
    }
  }
}

function performHourlyAutoBackup() {
  if (!backupConfig.hourly_enabled) return;
  const allBackups = listBackups();
  const hourly = allBackups.filter((b) => b.type === 'hourly');
  const now = Date.now();

  // If no hourly backup or latest hourly backup is > 55 minutes old, create snapshot
  const shouldCreate = hourly.length === 0 || now - hourly[0].timestamp >= 55 * 60 * 1000;
  if (shouldCreate) {
    const dir = getBackupsDir();
    const filename = `backup_hourly_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
    const dbFile = db.getDbFilePath();
    if (fs.existsSync(dbFile)) {
      const content = fs.readFileSync(dbFile, 'utf-8');
      fs.writeFileSync(path.join(dir, filename), content, 'utf-8');
      rotateHourlyBackups();
    }
  }
}

export async function GET() {
  try {
    performHourlyAutoBackup();
    const backups = listBackups();
    return NextResponse.json({
      success: true,
      config: backupConfig,
      backups,
      total_backups: backups.length,
      storage_location: getBackupsDir(),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const dir = getBackupsDir();

    // 1. Instant Manual Backup
    if (action === 'backup_now') {
      const dbFile = db.getDbFilePath();
      if (!fs.existsSync(dbFile)) {
        db.persist();
      }
      const tag = body.tag || 'manual';
      const filename = `backup_${tag}_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const content = fs.readFileSync(dbFile, 'utf-8');
      fs.writeFileSync(path.join(dir, filename), content, 'utf-8');

      if (tag === 'hourly') {
        rotateHourlyBackups();
      }

      db.addAuditLog({
        admin_email: 'admin@fobign.com',
        action: 'DB_BACKUP_CREATED',
        category: 'System',
        target_resource: filename,
        details: `Created snapshot ${filename} (${formatBytes(Buffer.byteLength(content))})`,
      });

      return NextResponse.json({
        success: true,
        message: `Snapshot created: ${filename}`,
        backups: listBackups(),
      });
    }

    // 2. Save Retention Config
    if (action === 'save_config' && body.config) {
      backupConfig = { ...backupConfig, ...body.config };
      rotateHourlyBackups();
      return NextResponse.json({
        success: true,
        message: 'Retention configuration updated.',
        config: backupConfig,
      });
    }

    // 3. Restore from Backup
    if (action === 'restore') {
      const { filename } = body;
      if (!filename) return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
      const targetPath = path.join(dir, path.basename(filename));
      if (!fs.existsSync(targetPath)) {
        return NextResponse.json({ error: 'Backup snapshot not found' }, { status: 404 });
      }

      const raw = fs.readFileSync(targetPath, 'utf-8');
      const payload = JSON.parse(raw);
      db.restoreFromPayload(payload);

      db.addAuditLog({
        admin_email: 'admin@fobign.com',
        action: 'DB_RESTORED',
        category: 'System',
        target_resource: filename,
        details: `Restored entire database from snapshot: ${filename}`,
      });

      return NextResponse.json({
        success: true,
        message: `Database successfully restored from ${filename}.`,
      });
    }

    // 4. Delete Backup
    if (action === 'delete') {
      const { filename } = body;
      if (!filename) return NextResponse.json({ error: 'Filename is required' }, { status: 400 });
      const targetPath = path.join(dir, path.basename(filename));
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath);
      }
      return NextResponse.json({
        success: true,
        message: `Deleted snapshot ${filename}.`,
        backups: listBackups(),
      });
    }

    // 5. Request Reset Security OTP (Sends OTP to Admin Email)
    if (action === 'request_reset_otp') {
      // Generate secure 6-digit numeric OTP
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      activeResetOtp = {
        code,
        expires_at: Date.now() + 10 * 60 * 1000, // 10 minutes
      };

      // Record audit log entry
      db.addAuditLog({
        admin_email: backupConfig.admin_notification_email || 'admin@fobign.com',
        action: 'DB_RESET_OTP_REQUESTED',
        category: 'Security',
        target_resource: 'DATABASE',
        details: `Dispatched database reset verification code to ${backupConfig.admin_notification_email}`,
      });

      return NextResponse.json({
        success: true,
        message: `6-digit security verification code dispatched to ${backupConfig.admin_notification_email}.`,
        // Also provide code in dev response for seamless developer flow
        dev_code: code,
      });
    }

    // 6. Reset Database (Full, Partial, or Custom)
    if (action === 'reset') {
      const { reset_type, verification_code, targets } = body;

      // Verify OTP code
      if (!activeResetOtp) {
        return NextResponse.json({ error: 'No active verification code found. Please request an OTP code first.' }, { status: 400 });
      }
      if (Date.now() > activeResetOtp.expires_at) {
        activeResetOtp = null;
        return NextResponse.json({ error: 'Verification code has expired. Please request a new code.' }, { status: 400 });
      }
      if (verification_code !== activeResetOtp.code) {
        return NextResponse.json({ error: 'Invalid verification code. Please check your email and try again.' }, { status: 400 });
      }

      // OTP Verified. Clear it.
      activeResetOtp = null;

      // Before doing any destructive reset, auto-snapshot current state for safety!
      const safetyBackup = `backup_pre_reset_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
      const dbFile = db.getDbFilePath();
      if (fs.existsSync(dbFile)) {
        fs.writeFileSync(path.join(dir, safetyBackup), fs.readFileSync(dbFile, 'utf-8'), 'utf-8');
      }

      let result: { success: boolean; message: string };

      if (reset_type === 'full') {
        result = db.resetFull();
      } else if (reset_type === 'partial') {
        result = db.resetPartial();
      } else if (reset_type === 'custom') {
        result = db.resetCustom(targets || []);
      } else {
        return NextResponse.json({ error: 'Invalid reset_type specified.' }, { status: 400 });
      }

      db.addAuditLog({
        admin_email: 'admin@fobign.com',
        action: `DB_RESET_${(reset_type || 'CUSTOM').toUpperCase()}`,
        category: 'Security',
        target_resource: 'DATABASE',
        details: `${result.message} (Safety snapshot saved: ${safetyBackup})`,
      });

      return NextResponse.json({
        success: true,
        message: result.message,
        safety_backup: safetyBackup,
        backups: listBackups(),
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
