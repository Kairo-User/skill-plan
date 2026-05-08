import { Button } from "@/components/ui/Button";

interface ReviewControlsProps {
  index: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
  onRandom: () => void;
}

export function ReviewControls({
  index,
  total,
  onPrev,
  onNext,
  onRandom,
}: ReviewControlsProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        variant="secondary"
        size="sm"
        onClick={onPrev}
        disabled={index === 0}
      >
        ← 上一张
      </Button>
      <Button variant="ghost" size="sm" onClick={onRandom}>
        🎲 随机
      </Button>
      <Button
        variant="secondary"
        size="sm"
        onClick={onNext}
        disabled={index === total - 1}
      >
        下一张 →
      </Button>
    </div>
  );
}
