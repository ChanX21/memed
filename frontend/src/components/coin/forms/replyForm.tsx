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
  refetch,
}: {
  setFocusedCommentId: (state: null) => void;
  commentId: number;
  refetch: () => any;
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
      replyToId: number | null;
    };

    const info: Info = {
      text: data.reply,
      tokenAddress: tokenAddress || "",
      userAddress: address || "",
      replyToId: commentId, // commentId should be a number or null
    };

    try {
      setIsLoading(true);
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND}comment`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(info),
        },
      );

      if (!response.ok) throw new Error("Reply failed!");

      const responseData = await response.json(); // Get the response data
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Reply submission failed.",
      });
    } finally {
      refetch();
      setIsLoading(false);
      form.reset();
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-[90%] m-auto bg-secondary px-2 py-3  space-y-6 "
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
                  className="resize-none border border-primary"
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
          <Button disabled={isLoading} type="submit">
            Reply
          </Button>
        </div>
      </form>
    </Form>
  );
}
