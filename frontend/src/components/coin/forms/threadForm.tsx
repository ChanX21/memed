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
  comment: z.string().min(1, {
    message: "comment cannot be empty",
  }),
});

export function ThreadForm({ refetch }: { refetch: () => any }) {
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
      text: data.comment,
      tokenAddress: tokenAddress || "",
      userAddress: address || "",
      replyToId: null,
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

      if (!response.ok) throw new Error("Comment failed!");

      const responseData = await response.json();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Comment submission failed.",
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
        className="w-full space-y-6 mb-10"
      >
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Comment</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Make a comment..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>You can post a thread.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="w-full flex justify-end">
          <Button disabled={isLoading} type="submit">
            Post
          </Button>
        </div>
      </form>
    </Form>
  );
}
