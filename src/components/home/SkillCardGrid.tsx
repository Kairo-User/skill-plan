import { SkillCard } from "./SkillCard";
import type { SkillCardData } from "@/types/database";

interface SkillCardGridProps {
  skills: SkillCardData[];
  onCheckIn: (skillId: string, skillName: string) => void;
}

export function SkillCardGrid({ skills, onCheckIn }: SkillCardGridProps) {
  if (skills.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🌟</p>
        <p className="text-[var(--muted-foreground)]">
          还没有学习计划呢～去导入一个吧！
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {skills.map(({ skill, todayCheckIn }) => (
        <SkillCard
          key={skill.id}
          skill={skill}
          todayCheckIn={todayCheckIn}
          onCheckIn={() => onCheckIn(skill.id, skill.name)}
        />
      ))}
    </div>
  );
}
