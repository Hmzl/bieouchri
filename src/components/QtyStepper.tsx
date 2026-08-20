interface QtyStepperProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
}

export function QtyStepper({ value, min = 0, max = 99, onChange }: QtyStepperProps) {
  return (
    <div className="qty">
      <button
        type="button"
        className="qty-btn"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        aria-label="Diminuer"
      >
        −
      </button>
      <span className="qty-val">{value}</span>
      <button
        type="button"
        className="qty-btn"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Augmenter"
      >
        +
      </button>
    </div>
  )
}
