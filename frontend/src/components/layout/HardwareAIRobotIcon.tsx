import React from 'react';

interface HardwareAIRobotIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  glow?: boolean;
}

/**
 * Hardware AI Robot Logo:
 * - Antenna with top horizontal crossbar
 * - Left and right side nubs/ears
 * - Rounded rectangular robot head
 * - Two vertical glowing capsule eyes
 */
export function HardwareAIRobotIcon({
  className = 'w-6 h-6',
  glow = true,
  ...props
}: HardwareAIRobotIconProps) {
  return (
    <svg
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <defs>
        {/* Eye & Head Soft Neon Glow */}
        <filter id="robotNeonGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="0" stdDeviation="1.2" floodColor="#93c5fd" floodOpacity="0.8" />
        </filter>
      </defs>

      <g filter={glow ? 'url(#robotNeonGlow)' : undefined}>
        {/* Top Antenna: Vertical stem + horizontal top cap */}
        <path
          d="M18 11.5V7M15 7H21"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Left and Right Side Pins / Ears */}
        <path
          d="M7.5 18H10.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M25.5 18H28.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />

        {/* Main Robot Face/Head (Rounded Rectangle) */}
        <rect
          x="10.5"
          y="12"
          width="15"
          height="12"
          rx="3.8"
          stroke="currentColor"
          strokeWidth="2.4"
          fill="currentColor"
          fillOpacity="0.06"
        />

        {/* Two Vertical Capsule / Pill Glowing Eyes */}
        <rect
          x="13.8"
          y="15.4"
          width="2.6"
          height="5.2"
          rx="1.3"
          fill="currentColor"
        />
        <rect
          x="19.6"
          y="15.4"
          width="2.6"
          height="5.2"
          rx="1.3"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

export default HardwareAIRobotIcon;
