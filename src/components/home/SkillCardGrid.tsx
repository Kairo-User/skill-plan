import { SkillCard } from "./SkillCard";
import type { SkillCardData } from "@/types/database";

interface SkillCardGridProps {
  skills: SkillCardData[];
  editMode: boolean;
  onCheckIn: (skillId: string, skillName: string) => void;
  onDelete: (skillId: string) => void;
}

export function SkillCardGrid({ skills, editMode, onCheckIn, onDelete }: SkillCardGridProps) {
  if (skills.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-4">🌟</p>
        <p className="text-[var(--muted-foreground)]">还没有学习计划呢～去新建一个吧！</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {skills.map(({ skill, todayCheckIn, subtasks }) => (
        <SkillCard
          key={skill.id}
          skill={skill}
          todayCheckIn={todayCheckIn}
          subtasks={subtasks}
          editMode={editMode}
          onCheckIn={() => onCheckIn(skill.id, skill.name)}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
