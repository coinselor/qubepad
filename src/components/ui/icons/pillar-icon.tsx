import React, { forwardRef } from 'react'

const PillarIcon = forwardRef<SVGSVGElement, React.ComponentPropsWithoutRef<'svg'>>(({ className, ...props }, ref) => {
	return (
		<svg
			ref={ref}
			className={className}
			width="18"
			height="27"
			viewBox="0 0 18 27"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			{...props}
		>
			<path d="M3.09961 4.32788V22.207L8.73605 25.9751L8.74669 7.613L3.09961 4.32788Z" stroke="#12FF3C" strokeWidth="0.75" strokeLinejoin="round" />
			<path d="M14.3941 4.32788V22.232L8.75771 26.0001L8.74707 7.613L14.3941 4.32788Z" stroke="#12FF3C" strokeWidth="0.75" strokeLinejoin="round" />
			<path d="M14.2827 4.19317L8.75195 1L3.22122 4.19317" stroke="#12FF3C" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M14.5383 8.65948L16.7654 9.93512L8.73538 14.5773L0.71582 9.94553L2.97427 8.63867" stroke="#12FF3C" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
			<path d="M14.5383 13.6202L16.7654 14.8958L8.73538 19.5381L0.71582 14.9062L2.97427 13.5994" stroke="#12FF3C" strokeWidth="0.75" strokeLinecap="round" strokeLinejoin="round" />
		</svg>
	)
})

PillarIcon.displayName = 'PillarIcon'

export default PillarIcon
