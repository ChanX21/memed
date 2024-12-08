"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useParams } from "react-router-dom";
import { useAccount } from "wagmi";

const FormSchema = z.object({
  reply: z.string().min(1, {
    message: "reply cannot be empty",
  }),
});

export function ReplyForm({
  setFocusedCommentId,
  commentId,
}: {
  setFocusedCommentId: (state: null) => void;
  commentId: number;
}) {
  const { address } = useAccount();
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    type Info = {
      text: string;
      tokenAddress: string;
      userAddress: string;
      replyToId: string;
    };

    const info: Info = {
      text: data.reply,
      tokenAddress: tokenAddress || "",
      userAddress: address || "",
      replyToId: commentId.toString(),
    };

    const formData = new FormData();
    for (const key in info) {
      formData.append(key, info[key as keyof Info] as string);
    }

    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND}comment`,
        {
          method: "POST",
          body: formData,
        },
      );

      if (!response.ok) throw new Error("Reply failed!");

      const data = await response.json();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Reply submission failed.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full space-y-6 mb-10"
      >
        <FormField
          control={form.control}
          name="reply"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reply</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your reply..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-2 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setFocusedCommentId(null)}>
            Cancel
          </Button>
          <Button type="submit">Reply</Button>
        </div>
      </form>
    </Form>
  );
}
