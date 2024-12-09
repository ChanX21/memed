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
import formatDistanceToNow from "date-fns/esm/formatDistanceToNow/index.js";
import { truncateWalletAddress } from "@/utils";

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
  createdAt: Date;
};

const Thread: React.FC<Props> = ({ title, onClick }) => {
  const { tokenAddress } = useParams<{ tokenAddress: string }>();
  const [focusedCommentId, setFocusedCommentId] = useState<number | null>(null);

  const handleReplyClick = (commentId: number) => {
    setFocusedCommentId(focusedCommentId === commentId ? null : commentId);
  };

  const { isPending, error, data, refetch } = useQuery({
    queryKey: ["commentData"],
    queryFn: () =>
      fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND}comment/${tokenAddress}`,
      ).then((res) => res.json()),
    refetchInterval: 500,
    refetchOnWindowFocus: true,
  });

  return (
    <div className="pb-10">
      <ThreadForm refetch={refetch} />

      {!error && data && data.length > 0 && (
        <div className="max-h-[100vh] overflow-y-auto flex flex-col gap-5">
          {data.map((comment: Comment, index: number) => (
            <Card key={index} className="w-full">
              <CardHeader>
                <CardDescription className="flex gap-3">
                  <p>
                    <span>By: </span>
                    <span>{truncateWalletAddress(comment.userAddress)}</span>
                  </p>
                  <p>
                    {formatDistanceToNow(
                      new Date(comment.createdAt.toString()),
                      { addSuffix: true },
                    )}
                  </p>
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
                  Reply ({comment.replies.length})
                </Button>
              </CardFooter>

              {/* Reply Form for the Focused Comment */}
              {focusedCommentId === comment.id && (
                <>
                  <ReplyForm
                    setFocusedCommentId={setFocusedCommentId}
                    commentId={comment.id}
                    refetch={refetch}
                  />

                  {/* Render Replies */}
                  <div className="max-h-[100vh] overflow-y-auto">
                    {comment.replies.length > 0 && (
                      <div className="ml-4 mt-4 space-y-4">
                        {comment.replies.map((reply: Reply, idx: number) => (
                          <Card key={idx} className="w-full bg-gray-600 pt-2">
                            <CardContent className="space-y-2">
                              <p>
                                <span>Reply by: </span>
                                <span>
                                  {truncateWalletAddress(reply.userAddress)}
                                </span>
                              </p>
                              <p>{reply.text}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Thread;
