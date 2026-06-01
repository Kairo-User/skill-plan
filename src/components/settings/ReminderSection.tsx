"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ReminderSection() {
  const [enabled, setEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("20:00");
  const [emailNotify, setEmailNotify] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [prefId, setPrefId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("user_preferences")
        .select("*")
        .maybeSingle();
      if (data) {
        setPrefId(data.id);
        setEnabled(data.reminder_enabled);
        setReminderTime(data.reminder_time?.substring(0, 5) ?? "20:00");
        setEmailNotify(data.email_notifications);
      }
    }
    load();
  }, [supabase]);

  async function handleSave() {
    setSaving(true);
    setMessage("");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage("请先登录");
      setSaving(false);
      return;
    }

    const payload = {
      user_id: user.id,
      reminder_enabled: enabled,
      reminder_time: reminderTime + ":00",
      email_notifications: emailNotify,
    };

    if (prefId) {
      const { error } = await supabase
        .from("user_preferences")
        .update(payload)
        .eq("id", prefId);
      if (error) {
        setMessage("保存失败：" + error.message);
        setSaving(false);
        return;
      }
    } else {
      const { data, error } = await supabase
        .from("user_preferences")
        .insert(payload)
        .select()
        .single();
      if (error || !data) {
        setMessage("保存失败：" + (error?.message ?? "未知错误") + "（请确认已在 Supabase 执行 sql/user_preferences.sql）");
        setSaving(false);
        return;
      }
      setPrefId(data.id);
    }

    setMessage("保存成功");
    setSaving(false);
  }

  return (
    <div>
      <h3 className="font-semibold text-[var(--foreground)] mb-3">提醒设置</h3>

      <div className="space-y-4">
        {/* Master toggle */}
        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-sm text-[var(--foreground)]">开启打卡提醒</span>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
            className="accent-[var(--primary)] w-5 h-5"
          />
        </label>

        {enabled && (
          <>
            {/* Reminder time */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-[var(--foreground)]">提醒时间</span>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-[var(--muted)] text-[var(--foreground)] text-sm border border-[var(--border)]"
              />
            </div>

            {/* Email toggle */}
            <label className="flex items-center justify-between cursor-pointer">
              <div>
                <span className="text-sm text-[var(--foreground)]">邮件通知</span>
                <p className="text-xs text-[var(--muted-foreground)]">
                  需要配置邮件服务（Resend 等）
                </p>
              </div>
              <input
                type="checkbox"
                checked={emailNotify}
                onChange={(e) => setEmailNotify(e.target.checked)}
                className="accent-[var(--primary)] w-5 h-5"
              />
            </label>
          </>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 rounded-xl text-sm bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "保存中..." : "保存设置"}
        </button>

        {message && (
          <p className={`text-sm ${message === "保存成功" ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
