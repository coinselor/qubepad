"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import PillarIcon from "./ui/icons/pillar-icon";
import { useState } from "react";
import { config } from "@/lib/config";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Info, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Pillar } from "@/types/Pillar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZnnAddress } from "@/lib/znn-address";
import { hexToBuffer } from "@/lib/utils";
import {
	PILLAR_NAME_MAX_LENGTH,
	PILLAR_NAME_REGEX,
	SIGNATURE_LENGTH,
	pillarFormSchema,
	type PillarFormSchema
} from "@/lib/validation/pillar";

type FormData = PillarFormSchema;

export default function RegistrationModal({
	pillar,
	onClose,
}: {
	pillar: Pillar;
	onClose: () => void;
}) {
	const { toast } = useToast();
	const form = useForm<FormData>({
		resolver: zodResolver(pillarFormSchema),
		defaultValues: {
			publicKey: pillar.alphanet_pillar_public_key || "",
			hqzName: pillar.hqz_pillar_name || "",
			hqzOwnerAddress: pillar.hqz_owner_address || "",
			hqzWithdrawAddress: pillar.hqz_withdraw_address || "",
			hqzProducerAddress: pillar.hqz_producer_address || "",
			signature: "",
		},
		mode: "onChange",
	});

	const messageString = `${pillar.alphanet_pillar_name} ${form.watch("hqzName") || "[hqz_pillar_name]"
		} ${form.watch("hqzOwnerAddress") || "[hqz_owner_address]"
		} ${form.watch("hqzWithdrawAddress") || "[hqz_withdraw_address]"
		} ${form.watch("hqzProducerAddress") || "[hqz_producer_address]"
		} `;

	const SignatureSuffix = () => (
		<Popover>
			<PopoverTrigger asChild>
				<Badge
					variant="success"
					className="cursor-pointer rounded-sm hover:bg-green-900/80"
				>
					{config.signature.messageSuffix}
				</Badge>
			</PopoverTrigger>
			<PopoverContent className="w-80">
				<div className="space-y-2">
					<h4 className="font-medium text-sm leading-none">Signature Message Suffix</h4>
					<p className="text-xs text-muted-foreground">
						This is a truncated SHA-256 hash of HyperQube&apos;s CoC. By signing this message, you signal your agreement to it.
					</p>
					<a
						href="https://github.com/coinselor/qubepad/blob/main/CODE_OF_CONDUCT.md"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center space-x-1 text-xs text-primary"
					>
						<span className="text-green-400">View Code of Conduct</span>
						<ExternalLink className="h-3 w-3 text-green-400" />
					</a>
				</div>
			</PopoverContent>
		</Popover>
	);

	const fullMessageString = `${messageString}${config.signature.messageSuffix}`;

	const messageStringWithSuffix = (
		<div className="font-mono text-zinc-400 text-xs p-3 rounded-md border border-zinc-700 border-input bg-transparent">
			{messageString}
			<SignatureSuffix />
		</div>
	);

	const getFormProgress = () => {
		const fields: (keyof FormData)[] = ['hqzName', 'hqzOwnerAddress', 'hqzWithdrawAddress', 'hqzProducerAddress'];
		return fields.map(field => {
			const fieldState = form.getFieldState(field);
			return !fieldState.invalid && form.getValues(field);
		});
	};

	const validSteps = getFormProgress();
	const isFormComplete = validSteps.every(step => step);

	const [isCopied, setIsCopied] = useState(false);

	const copyMessageString = async () => {
		try {
			await navigator.clipboard.writeText(fullMessageString);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000);
			toast({
				description: "Message copied to clipboard",
			});
		} catch (error) {
			console.error("Failed to copy message:", error);
			toast({
				variant: "destructive",
				description: "Failed to copy message",
			});
		}
	};

	const onSubmit = async (data: FormData) => {
		try {
			const pubKeyBuffer = hexToBuffer(data.publicKey);
			if (!ZnnAddress.verifyPublicKey(pillar.alphanet_pillar_address, pubKeyBuffer)) {
				form.setError("publicKey", {
					type: "manual",
					message: "Public key does not match pillar&apos;s address"
				});
				return;
			}
			const response = await fetch(`/api/pillars`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					pillarName: pillar.alphanet_pillar_name,
					data: {
						publicKey: data.publicKey,
						hqz_pillar_name: data.hqzName,
						hqz_owner_address: data.hqzOwnerAddress,
						hqz_withdraw_address: data.hqzWithdrawAddress,
						hqz_producer_address: data.hqzProducerAddress,
						signature: data.signature,
					},
				}),
			});

			const result = await response.json();

			if (!response.ok) {
				toast({
					variant: "destructive",
					title: "Error",
					description: result.error || "Failed to update pillar",
				});
				return;
			}

			toast({
				title: "",
				description: (
					<div className="flex items-center">
						<div className="flex-none">
							<PillarIcon className="h-6 w-6" />
						</div>
						<div className="flex-1 ml-2">
							{result.pillarName} registered successfully
						</div>
					</div>
				),
			});

			onClose();
		} catch (err) {
			console.error(err);
			toast({
				variant: "destructive",
				title: "Error",
				description: "An unexpected error occurred",
			});
		}
	};

	return (
		<Dialog open={true} onOpenChange={onClose} modal={false}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Register {pillar.alphanet_pillar_name}</DialogTitle>
					<DialogDescription>
						Enter your pillar details to register for hyperqube_z
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="publicKey"
							render={({ field }) => {
								const publicKeyValue = field.value;
								return (
									<FormItem className="opacity-70">
										<div className="flex items-center gap-2">
											<FormLabel className="text-[14px]">Public Key</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<Info className="h-4 w-4 text-zinc-400 hover:text-foreground transition-colors cursor-pointer" />
												</PopoverTrigger>
												<PopoverContent side="right" align="center" className="w-auto p-2 text-[13px]">
													<p>{pillar.alphanet_pillar_name}&apos;s public key (64 hexadecimal characters)</p>
												</PopoverContent>
											</Popover>
										</div>
										<FormControl>
											<div className="space-y-2 relative">
												{publicKeyValue && (
													<div className="absolute right-0 -top-5 text-[13px] opacity-80 text-center">
														<span className={`${publicKeyValue.length === 64
															? "text-green-600"
															: "text-gray-500"
															}`}>
															{publicKeyValue.length}/64 characters
														</span>
													</div>
												)}
												<Input
													placeholder="fcf99ab256464f03e3..."
													{...field}
													readOnly
													className={`${form.formState.errors.publicKey ? "" : "!bg-green-950/40 !border-green-600/40 text-green-400"} ${publicKeyValue?.length === 64 ? "!border-l-8 !border-l-green-600" : ""}`}
													tabIndex={-1}
													maxLength={64}
													error={!!form.formState.errors.publicKey}
												/>
												<div className="absolute top-0 right-0 bottom-0 w-12 pointer-events-none bg-gradient-to-r from-transparent to-background" />
											</div>
										</FormControl>
										<FormMessage className="text-xs text-center" />
									</FormItem>
								)
							}}
						/>
						<hr className="my-6 border-t border-dashed border-zinc-600 dark:border-zinc-800" />
						<FormField
							control={form.control}
							name="hqzName"
							render={({ field }) => {
								const value = field.value || '';
								return (
									<FormItem>
										<div className="flex items-center gap-2">
											<FormLabel className="text-[14px]">HyperQube_z Pillar Name</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<Info className="h-4 w-4 text-zinc-400 hover:text-foreground transition-colors cursor-pointer" />
												</PopoverTrigger>
												<PopoverContent side="top" align="center" className="w-auto p-2 text-[13px]">
													<p>Choose a unique name using letters, numbers, and optional<br /> single hyphens, dots, or underscores between characters</p>
												</PopoverContent>
											</Popover>
										</div>
										<FormControl>
											<div className="space-y-2 relative">
												{value && (
													<div className="absolute right-0 -top-5 text-[13px] opacity-80 text-center">
														<span className={`${value.length <= PILLAR_NAME_MAX_LENGTH && PILLAR_NAME_REGEX.test(value)
															? "text-green-600"
															: "text-gray-500"
															}`}>
															{value.length}/{PILLAR_NAME_MAX_LENGTH} characters
														</span>
													</div>
												)}
												<Input
													placeholder="my-awesome-pillar"
													{...field}
													onChange={(e) => {
														const value = e.target.value;
														field.onChange(value);
													}}
													maxLength={PILLAR_NAME_MAX_LENGTH}
													error={!!form.formState.errors.hqzName}
													className="font-space"
												/>
												<div className="absolute top-0 right-0 bottom-0 w-12 pointer-events-none bg-gradient-to-r from-transparent to-background" />
											</div>
										</FormControl>
										<FormMessage className="text-xs text-center" />
									</FormItem>
								)
							}}
						/>
						<FormField
							control={form.control}
							name="hqzOwnerAddress"
							render={({ field }) => {
								const value = field.value || '';
								return (
									<FormItem>
										<div className="flex items-center gap-2">
											<FormLabel className="text-[14px]">HyperQube_z Owner Address</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<Info className="h-4 w-4 text-zinc-400 hover:text-foreground transition-colors cursor-pointer" />
												</PopoverTrigger>
												<PopoverContent side="top" align="center" className="w-auto p-2 text-[13px]">
													<p>The address that will own and control this pillar</p>
												</PopoverContent>
											</Popover>
										</div>
										<FormControl>
											<div className="space-y-2 relative">
												{value && (
													<div className="absolute right-0 -top-5 text-[13px] opacity-80 text-center">
														<span className={`${ZnnAddress.isValid(value)
															? "text-green-600"
															: "text-gray-500"
															}`}>
															{ZnnAddress.isValid(value) ? "valid" : "invalid"}
														</span>
													</div>
												)}
												<Input
													placeholder="z1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsggv2f"
													{...field}
													onChange={(e) => {
														const value = e.target.value;
														field.onChange(value);
													}}
													error={!!form.formState.errors.hqzOwnerAddress}
													className="font-space"
												/>
												<div className="absolute top-0 right-0 bottom-0 w-12 pointer-events-none bg-gradient-to-r from-transparent to-background" />
											</div>
										</FormControl>
										<FormMessage className="text-xs text-center" />
									</FormItem>
								)
							}}
						/>
						<FormField
							control={form.control}
							name="hqzWithdrawAddress"
							render={({ field }) => {
								const value = field.value || '';
								return (
									<FormItem>
										<div className="flex items-center gap-2">
											<FormLabel className="text-[14px]">HyperQube_z Withdraw Address</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<Info className="h-4 w-4 text-zinc-400 hover:text-foreground transition-colors cursor-pointer" />
												</PopoverTrigger>
												<PopoverContent side="top" align="center" className="w-auto p-2 text-[13px]">
													<p>The address that will receive pillar rewards</p>
												</PopoverContent>
											</Popover>
										</div>
										<FormControl>
											<div className="space-y-2 relative">
												{value && (
													<div className="absolute right-0 -top-5 text-[13px] opacity-80 text-center">
														<span className={`${ZnnAddress.isValid(value)
															? "text-green-600"
															: "text-gray-500"
															}`}>
															{ZnnAddress.isValid(value) ? "valid" : "invalid"}
														</span>
													</div>
												)}
												<Input
													placeholder="z1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsggv2f"
													{...field}
													onChange={(e) => {
														const value = e.target.value;
														field.onChange(value);
													}}
													error={!!form.formState.errors.hqzWithdrawAddress}
													className="font-space"
												/>
												<div className="absolute top-0 right-0 bottom-0 w-12 pointer-events-none bg-gradient-to-r from-transparent to-background" />
											</div>
										</FormControl>
										<FormMessage className="text-xs text-center" />
									</FormItem>
								)
							}}
						/>
						<FormField
							control={form.control}
							name="hqzProducerAddress"
							render={({ field }) => {
								const value = field.value || '';
								return (
									<FormItem>
										<div className="flex items-center gap-2">
											<FormLabel className="text-[14px]">HyperQube_z Producer Address</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<Info className="h-4 w-4 text-zinc-400 hover:text-foreground transition-colors cursor-pointer" />
												</PopoverTrigger>
												<PopoverContent side="top" align="center" className="w-auto p-2 text-[13px]">
													<p>The address that will produce momentums</p>
												</PopoverContent>
											</Popover>
										</div>
										<FormControl>
											<div className="space-y-2 relative">
												{value && (
													<div className="absolute right-0 -top-5 text-[13px] opacity-80 text-center">
														<span className={`${ZnnAddress.isValid(value)
															? "text-green-600"
															: "text-gray-500"
															}`}>
															{ZnnAddress.isValid(value) ? "valid" : "invalid"}
														</span>
													</div>
												)}
												<Input
													placeholder="z1qqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqsggv2f"
													{...field}
													onChange={(e) => {
														const value = e.target.value;
														field.onChange(value);
													}}
													error={!!form.formState.errors.hqzProducerAddress}
													className="font-space"
												/>
												<div className="absolute top-0 right-0 bottom-0 w-12 pointer-events-none bg-gradient-to-r from-transparent to-background" />
											</div>
										</FormControl>
										<FormMessage className="text-xs text-center" />
									</FormItem>
								)
							}}
						/>


						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<FormLabel className="text-[14px]">Message</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<Info className="h-4 w-4 text-zinc-400 hover:text-foreground transition-colors cursor-pointer" />
									</PopoverTrigger>
									<PopoverContent side="right" align="center" className="w-auto p-2 text-[13px]">
										<p>This is the message text that needs<br /> to be signed in ✦ s y r i u s</p>
									</PopoverContent>
								</Popover>
							</div>
							<div className="space-y-2">
								<div className="space-y-2 text-sm">
									{messageStringWithSuffix}
								</div>
								<div className="flex gap-1 mt-2 mb-1">
									{validSteps.map((isValid, index) => (
										<div
											key={index}
											className={`h-1 flex-1 rounded-full transition-colors duration-300 ${isValid ? 'bg-green-600' : 'bg-zinc-200 dark:bg-zinc-800'
												}`}
										/>
									))}
								</div>
								<AnimatePresence mode="wait">
									{messageString && (
										<motion.div
											initial={{ opacity: 0, scale: 0.95 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.95 }}
											transition={{ duration: 0.2 }}
											className="w-full"
										>
											<Button
												type="button"
												variant="outline"
												className="w-full"
												onClick={copyMessageString}
												disabled={!isFormComplete}
											>
												<AnimatePresence mode="wait">
													{isCopied ? (
														<motion.div
															key="copied"
															initial={{ opacity: 0, y: 20 }}
															animate={{ opacity: 1, y: 0 }}
															exit={{ opacity: 0, y: -20 }}
															className="flex items-center gap-2"
														>
															<Copy className="h-4 w-4" />
															<span>Copied!</span>
														</motion.div>
													) : (
														<motion.div
															key="copy"
															initial={{ opacity: 0, y: 20 }}
															animate={{ opacity: 1, y: 0 }}
															exit={{ opacity: 0, y: -20 }}
															className="flex items-center gap-2"
														>
															<Copy className="h-4 w-4" />
															<span>Copy Message</span>
														</motion.div>
													)}
												</AnimatePresence>
											</Button>
										</motion.div>
									)}
								</AnimatePresence>
							</div>
						</div>
						<hr className="my-6 border-t border-dashed border-zinc-600 dark:border-zinc-800" />
						<FormField
							control={form.control}
							name="signature"
							render={({ field }) => {
								const value = field.value || '';
								return (
									<FormItem>
										<div className="flex items-center gap-2">
											<FormLabel className="text-[14px]">Signature</FormLabel>
											<Popover>
												<PopoverTrigger asChild>
													<Info className="h-4 w-4 text-zinc-400 hover:text-foreground transition-colors cursor-pointer" />
												</PopoverTrigger>
												<PopoverContent side="top" align="center" className="w-auto p-2 text-[13px]">
													<p>{pillar.alphanet_pillar_name}&apos;s 128-character Ed25519 signature in hexadecimal format</p>
												</PopoverContent>
											</Popover>
										</div>
										<FormControl>
											<div className="space-y-2 relative">
												{value && (
													<div className="absolute right-0 -top-5 text-[13px] opacity-80 text-center">
														<span className={`${value.length === SIGNATURE_LENGTH
															? "text-green-600"
															: "text-gray-500"
															}`}>
															{value.length}/{SIGNATURE_LENGTH} characters
														</span>
													</div>
												)}
												<Input
													placeholder="b27a32f780f3df6cfab01d8b..."
													{...field}
													onChange={(e) => {
														const value = e.target.value;
														field.onChange(value);
													}}
													maxLength={SIGNATURE_LENGTH}
													error={!!form.formState.errors.signature}
													className="font-space"
												/>
												<div className="absolute top-0 right-0 bottom-0 w-12 pointer-events-none bg-gradient-to-r from-transparent to-background" />
											</div>
										</FormControl>
										<FormMessage className="text-xs text-center" />
									</FormItem>
								)
							}}
						/>
						<div className="flex justify-end space-x-4 pt-4">
							<Button variant="outline" onClick={onClose}>
								Cancel
							</Button>
							<Button type="submit">Register</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
