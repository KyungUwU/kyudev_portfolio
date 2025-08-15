"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";

const contactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters").max(100, "Subject must be less than 100 characters"),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message must be less than 1000 characters"),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

interface ApiResponse {
  error?: string;
  message?: string;
  id?: string;
}

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result: ApiResponse = await response.json();

      if (response.ok) {
        toast.success("Message sent! Thanks for reaching out. I'll get back to you soon.");
        reset();
      } else {
        toast.error(result.error || "Failed to send message. Please try again.");
      }
    } catch (error) {
      console.error("Contact form error:", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  /** helper to render input + error */
  const FormField = ({
    id,
    label,
    children,
    error,
  }: {
    id: string;
    label: string;
    children: React.ReactNode;
    error?: string;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm font-medium text-zinc-200">
        {label}
      </Label>
      {children}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
    >
      <div className="relative overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-800/50 p-6 backdrop-blur-xs transition-all duration-300 hover:border-purple-500/50">
        <div className="absolute -inset-1 rounded-xl bg-linear-to-r from-purple-500/10 to-pink-500/10 opacity-25 blur-sm transition duration-1000 hover:opacity-100 hover:duration-200"></div>

        <div className="relative">
          <h3 className="mb-6 text-2xl font-bold">Send Me a Message</h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <FormField id="name" label="Name" error={errors.name?.message}>
              <Input
                id="name"
                placeholder="Your Name"
                disabled={isSubmitting}
                {...register("name")}
                className="border-zinc-700 bg-zinc-900/50 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </FormField>

            <FormField id="email" label="Email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                placeholder="Your Email"
                disabled={isSubmitting}
                {...register("email")}
                className="border-zinc-700 bg-zinc-900/50 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </FormField>

            <FormField id="subject" label="Subject" error={errors.subject?.message}>
              <Input
                id="subject"
                placeholder="Subject"
                disabled={isSubmitting}
                {...register("subject")}
                className="border-zinc-700 bg-zinc-900/50 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </FormField>

            <FormField id="message" label="Message" error={errors.message?.message}>
              <Textarea
                id="message"
                placeholder="Your Message"
                rows={5}
                disabled={isSubmitting}
                {...register("message")}
                className="border-zinc-700 bg-zinc-900/50 focus:border-purple-500 focus:ring-purple-500/20"
              />
            </FormField>

            <Button type="submit" variant="primary" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>Sending...</>
              ) : (
                <>
                  Send Message <Send className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
