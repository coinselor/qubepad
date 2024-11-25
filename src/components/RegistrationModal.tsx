"use client";

import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import PillarIcon from "./ui/icons/pillar-icon";

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
			publicKey: "",
			hqzName: pillar.hqz_pillar_name || "",
			hqzOwnerAddress: pillar.hqz_owner_address || "",
			hqzWithdrawAddress: pillar.hqz_withdraw_address || "",
			hqzProducerAddress: pillar.hqz_producer_address || "",
			signature: "",
		},
		mode: "onChange",
	});

	const publicKeyValue = form.watch("publicKey");

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
		<Dialog open={true} onOpenChange={onClose}>
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
							render={({ field }) => (
								<FormItem>
									<div className="flex items-center gap-2">
										<FormLabel className="text-[14px]">Public Key</FormLabel>
										<Tooltip delayDuration={200} defaultOpen={false}>
											<TooltipTrigger asChild>
												<Info className="h-4 w-4 text-zinc-400 hover:text-foreground transition-colors" />
											</TooltipTrigger>
											<TooltipContent side="top" align="center" className="text-[13px]">
												<p>{pillar.alphanet_pillar_name}&apos;s public key (64 hexadecimal characters)</p>
											</TooltipContent>
										</Tooltip>
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
												onChange={(e) => {
													const value = e.target.value;
													field.onChange(value);
												}}
												maxLength={64}
												error={!!form.formState.errors.publicKey}
												className="font-space"
											/>
											<div className="absolute top-0 right-0 bottom-0 w-12 pointer-events-none bg-gradient-to-r from-transparent to-background" />
										</div>
									</FormControl>
									<FormMessage className="text-xs text-center" />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="hqzName"
							render={({ field }) => {
								const value = field.value || '';
								return (
									<FormItem>
										<div className="flex items-center gap-2">
											<FormLabel className="text-[14px]">HyperQube_z Pillar Name</FormLabel>
											<Tooltip delayDuration={200}>
												<TooltipTrigger asChild>
													<Info className="h-4 w-4 text-zinc-400 hover:text-foreground transition-colors" />
												</TooltipTrigger>
												<TooltipContent side="top" align="center" className="text-[13px]">
													<p>Choose a unique name using letters, numbers, and optional<br /> single hyphens, dots, or underscores between characters</p>
												</TooltipContent>
											</Tooltip>
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
											<Tooltip delayDuration={200}>
												<TooltipTrigger asChild>
													<Info className="h-4 w-4 text-zinc-400 hover:text-foreground transition-colors" />
												</TooltipTrigger>
												<TooltipContent side="top" align="center" className="text-[13px]">
													<p>The address that will own and control this pillar</p>
												</TooltipContent>
											</Tooltip>
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
											<Tooltip delayDuration={200}>
												<TooltipTrigger asChild>
													<Info className="h-4 w-4 text-zinc-400 hover:text-foreground transition-colors" />
												</TooltipTrigger>
												<TooltipContent side="top" align="center" className="text-[13px]">
													<p>The address that will receive pillar rewards</p>
												</TooltipContent>
											</Tooltip>
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
											<Tooltip delayDuration={200}>
												<TooltipTrigger asChild>
													<Info className="h-4 w-4 text-zinc-400 hover:text-foreground transition-colors" />
												</TooltipTrigger>
												<TooltipContent side="top" align="center" className="text-[13px]">
													<p>The address that will produce momentums</p>
												</TooltipContent>
											</Tooltip>
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
						<FormField
							control={form.control}
							name="signature"
							render={({ field }) => {
								const value = field.value || '';
								return (
									<FormItem>
										<div className="flex items-center gap-2">
											<FormLabel className="text-[14px]">Signature</FormLabel>
											<Tooltip delayDuration={200}>
												<TooltipTrigger asChild>
													<Info className="h-4 w-4 text-zinc-400 hover:text-foreground transition-colors" />
												</TooltipTrigger>
												<TooltipContent side="top" align="center" className="text-[13px]">
													<p>{pillar.alphanet_pillar_name}&apos;s 128-character Ed25519 signature in hexadecimal format</p>
												</TooltipContent>
											</Tooltip>
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
