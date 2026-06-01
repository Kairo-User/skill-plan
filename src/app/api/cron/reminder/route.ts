// Vercel Cron Job: 每日打卡提醒
// 在 Vercel Dashboard → Cron Jobs 中添加以下配置：
//   - Method: GET
//   - URL: /api/cron/reminder
//   - Schedule: 每天 20:00（或用户设置的提醒时间）
//
// 如需邮件通知，需配置 RESEND_API_KEY 环境变量

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json({ error: "Missing env" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. 查询开启了提醒的用户
  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("user_id, reminder_time, email_notifications")
    .eq("reminder_enabled", true);

  if (!prefs || prefs.length === 0) {
    return NextResponse.json({ ok: true, skipped: "no users with reminders" });
  }

  const today = new Date().toISOString().substring(0, 10);
  const results: string[] = [];

  for (const pref of prefs) {
    // 2. 查询用户所有技能
    const { data: skills } = await supabase
      .from("skills")
      .select("id, name")
      .eq("user_id", pref.user_id);

    if (!skills || skills.length === 0) continue;

    const missed: string[] = [];

    for (const skill of skills) {
      // 3. 检查今天是否已打卡
      const { count } = await supabase
        .from("check_ins")
        .select("*", { count: "exact", head: true })
        .eq("skill_id", skill.id)
        .eq("date", today);

      if (count === 0) {
        missed.push(skill.name);
      }
    }

    if (missed.length > 0) {
      results.push(`User ${pref.user_id}: missed ${missed.join(", ")}`);

      // 4. 如果开启邮件通知，发送提醒邮件
      if (pref.email_notifications) {
        // TODO: 接入邮件服务（Resend / SendGrid 等）
        // const { data: user } = await supabase.auth.admin.getUserById(pref.user_id);
        // await sendEmail(user.email, "打卡提醒", `今天还没有打卡：${missed.join("、")}`);
      }
    }
  }

  return NextResponse.json({ ok: true, notified: results.length, details: results });
}
