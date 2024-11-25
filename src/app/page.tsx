"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";



const HyperCube = () => {
	const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

	useEffect(() => {
		const interval = setInterval(() => {
			setRotation(prev => ({
				x: (prev.x + 0.5) % 360,
				y: (prev.y + 0.5) % 360,
				z: (prev.z + 0.25) % 360
			}));
		}, 50);
		return () => clearInterval(interval);
	}, []);

	const calculatePoints = useCallback((size: number) => {
		const points = [
			[-size, -size, -size], [size, -size, -size],
			[size, size, -size], [-size, size, -size],
			[-size, -size, size], [size, -size, size],
			[size, size, size], [-size, size, size],
		].map(([x, y, z]) => {
			const rad = Math.PI / 180;
			const { x: rotX, y: rotY, z: rotZ } = rotation;
			const cs = [Math.cos(rotX * rad), Math.cos(rotY * rad), Math.cos(rotZ * rad)];
			const sn = [Math.sin(rotX * rad), Math.sin(rotY * rad), Math.sin(rotZ * rad)];
			const x1 = x;
			const y1 = y * cs[0] - z * sn[0];
			const z1 = y * sn[0] + z * cs[0];
			const x2 = x1 * cs[1] + z1 * sn[1];
			const y2 = y1;
			const z2 = -x1 * sn[1] + z1 * cs[1];
			const x3 = x2 * cs[2] - y2 * sn[2];
			const y3 = x2 * sn[2] + y2 * cs[2];
			return [x3, y3];
		});
		return points;
	}, [rotation]);

	const points = useMemo(() => ({
		outer: calculatePoints(35),
		inner: calculatePoints(20)
	}), [calculatePoints]);

	const jumpAnimation = useMemo(() => {
		const baseHeight = 40;
		const bounceHeight = 70;
		return {
			y: [
				baseHeight,
				baseHeight - bounceHeight,
				baseHeight + 2,
				baseHeight
			],
			transition: {
				y: {
					duration: 2.4,
					repeat: Infinity,
					times: [0, 0.25, 0.95, 1],
					ease: [
						"easeOut",
						"easeIn",
						"easeOut"
					]
				}
			}
		};
	}, []);

	return (
		<div className="relative w-full aspect-square">
			<svg viewBox="-100 -100 200 200" className="w-full h-full">
				<defs>
					<linearGradient id="cube-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
						<stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
					</linearGradient>
					<linearGradient id="neon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
						<stop offset="0%" stopColor="rgba(0,255,128,0.7)" />
						<stop offset="100%" stopColor="rgba(0,255,128,0.3)" />
					</linearGradient>
					<filter id="neon-glow">
						<feGaussianBlur in="SourceGraphic" stdDeviation="2" />
						<feComposite operator="over" in2="SourceGraphic" />
					</filter>
				</defs>

				<motion.g
					animate={jumpAnimation}
				>
					{createFaces(points.outer).map((face, i) => (
						<polygon
							key={`outer-${i}`}
							points={face.map(p => p.join(',')).join(' ')}
							fill="url(#cube-gradient)"
							stroke="rgba(255,255,255,0.2)"
							strokeWidth="0.8"
							opacity="0.3"
						/>
					))}

					{Array.from({ length: 8 }).map((_, i) => (
						<line
							key={i}
							x1={points.outer[i][0]}
							y1={points.outer[i][1]}
							x2={points.inner[i][0]}
							y2={points.inner[i][1]}
							stroke="rgba(255,255,255,0.2)"
							strokeWidth="0.4"
						/>
					))}

					{createFaces(points.inner).map((face, i) => (
						<polygon
							key={`inner-${i}`}
							points={face.map(p => p.join(',')).join(' ')}
							fill="rgba(0,255,128,0.1)"
							stroke="url(#neon-gradient)"
							strokeWidth="1.5"
							opacity="0.8"
							filter="url(#neon-glow)"
							className="animate-pulse"
						>
							<animate
								attributeName="fill-opacity"
								values="0.1;0.3;0.1"
								dur="3s"
								repeatCount="indefinite"
							/>
						</polygon>
					))}
				</motion.g>
			</svg>
		</div>
	);
};

const createFaces = (points: number[][]) => [
	[0, 1, 2, 3], [4, 5, 6, 7], [0, 4, 7, 3],
	[1, 5, 6, 2], [3, 2, 6, 7], [0, 1, 5, 4]
].map(face => face.map(i => points[i]));

export default function Home() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener('scroll', handleScroll);
		return () => window.removeEventListener('scroll', handleScroll);
	}, []);

	return (
		<div className="bg-black min-h-screen">
			<header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/80 backdrop-blur-sm border-b border-gray-800' : ''}`}>
				<div className="max-w-7xl mx-auto px-4 sm:px-6">
					<div className="h-16 flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<span className="text-white font-light">QubePad</span>
							<div className="flex items-center gap-1.5">
								<Badge variant="outline" className="text-xs text-gray-300 border-gray-700 px-2 py-0.5 flex items-center gap-1.5">
									<span className="relative flex h-2 w-2">
										<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
										<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
									</span>
									<span>hyperqube_z</span>
									<span className="text-emerald-500 font-medium">now live</span>
								</Badge>
							</div>
						</div>
					</div>
				</div>
			</header>

			<main className="flex min-h-screen relative">
				<div className="absolute inset-0 bg-gradient-to-tr from-[#00ff80]/5 via-transparent to-transparent" />
				<div className="container mx-auto px-4">
					<div className="flex min-h-screen items-center">
						<div className="flex flex-col md:flex-row w-full items-center justify-between gap-16 pt-16 md:pt-0">
							<div className="w-full md:w-1/2 flex flex-col space-y-8 text-center md:text-left order-2 md:order-1">
								<div className="space-y-6">
									<h1 className="text-5xl lg:text-6xl xl:text-7xl font-light leading-[1.2]">
										<span className="text-white block">hyperqube_z</span>
									</h1>
									<p className="text-lg text-gray-400 max-w-lg mx-auto md:mx-0">
										Join the the first HyperQube powered network.
									</p>
								</div>
								<div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
									<Link href="/register">
										<Button size="lg" className="bg-[#00ff80] hover:bg-[#00ff80]/90 text-black font-medium group relative overflow-hidden">
											<span className="relative z-10">Sign Up</span>
										</Button>
									</Link>
								</div>
							</div>
							<div className="w-full md:w-1/2 md:pl-8 order-1 md:order-2">
								<div className="relative max-w-xl mx-auto">
									<div className="absolute -inset-4 bg-[#00ff80]/10 blur-2xl rounded-full" />
									<div className="relative">
										<HyperCube />
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}
