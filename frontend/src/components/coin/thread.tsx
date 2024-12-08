import React, { useState } from "react";
import { ThreadForm } from "./forms/threadForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { ReplyForm } from "./forms/replyForm";

interface Props {
  title?: string;
  onClick?: () => void;
}

type Reply = {
  id: number;
  text: string;
  userAddress: string;
};

type Comment = {
  id: number;
  text: string;
  tokenId: number;
  userAddress: string;
  replyToId: string;
  replies: Reply[];
};

const Thread: React.FC<Props> = ({ title, onClick }) => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const [focusedCommentId, setFocusedCommentId] = useState<number | null>(null);

  const handleReplyClick = (commentId: number) => {
    setFocusedCommentId(focusedCommentId === commentId ? null : commentId);
  };

  const { isPending, error, data } = useQuery({
    queryKey: ["commentData"],
    queryFn: () =>
      fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND}comment/${tokenAddress}`,
      ).then((res) => res.json()),
  });

  return (
    <div className="pb-10">
      <ThreadForm />

      {!error && data && data.length > 0 && (
        <div className="max-h-[100vh] overflow-y-auto flex flex-col gap-5">
          {data.map((comment: Comment, index: number) => (
            <Card key={index} className="w-full">
              <CardHeader>
                <CardDescription className="flex gap-3">
                  <p>
                    <span>By: </span>
                    <span>{comment.userAddress}</span>
                  </p>
                  <p>3 days ago.</p>
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>{comment.text}</p>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  variant="ghost"
                  onClick={() => handleReplyClick(comment.id)}
                >
                  Reply
                </Button>
              </CardFooter>

              {/* Reply Form for the Focused Comment */}
              {focusedCommentId === comment.id && (
                <ReplyForm
                  setFocusedCommentId={setFocusedCommentId}
                  commentId={comment.id}
                />
              )}

              {/* Render Replies */}
              {comment.replies.length > 0 && (
                <div className="ml-4 mt-4 space-y-4">
                  {comment.replies.map((reply: Reply, idx: number) => (
                    <Card key={idx} className="w-full bg-gray-100">
                      <CardContent className="space-y-2">
                        <p>
                          <span>Reply by: </span>
                          <span>{reply.userAddress}</span>
                        </p>
                        <p>{reply.text}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Thread;
