"use client";

type QuickSpecsBarProps = {
  horsepower?: string;
  mileage: string;
  condition: string;
  warranty: string;
};

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="quick-spec-item">
      <span className="quick-spec-value">{value}</span>
      <span className="quick-spec-label">{label}</span>
    </div>
  );
}

export default function QuickSpecsBar({
  horsepower,
  mileage,
  condition,
  warranty,
}: QuickSpecsBarProps) {
  return (
    <div className="quick-specs-bar">
      {horsepower && <SpecItem label="Horsepower" value={horsepower} />}
      <SpecItem label="Mileage" value={mileage} />
      <SpecItem label="Condition" value={condition} />
      <SpecItem label="Warranty" value={warranty} />

      <style jsx>{`
        .quick-specs-bar {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 14px;
          padding: 12px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        @media (min-width: 768px) {
          .quick-specs-bar {
            grid-template-columns: repeat(4, minmax(0, 1fr));
          }
        }

        .quick-spec-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
          padding: 8px 10px;
          border-radius: 8px;
          background: rgba(0, 0, 0, 0.22);
          border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .quick-spec-value {
          font-size: 13px;
          font-weight: 700;
          color: #fff;
          line-height: 1.3;
        }

        .quick-spec-label {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.48);
        }
      `}</style>
    </div>
  );
}
