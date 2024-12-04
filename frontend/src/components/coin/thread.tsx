import React from "react";
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

interface Props {
  title?: string;
  onClick?: () => void;
}

const Thread: React.FC<Props> = ({ title, onClick }) => {
  return (
    <div className=" pb-10">
      <ThreadForm />
      <div className="max-h-[100vh] overflow-y-auto flex flex-col gap-5">
        {Array.from({ length: 10 }).map((_, index) => (
          <Card key={index} className="w-full">
            <CardHeader>
              <CardDescription className="flex gap-3">
                <p>
                  <span>By: </span>
                  <span>0x00 </span>
                </p>
                <p> 3 days ago.</p>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>
                Prime Coin is a pioneering cryptocurrency tailored for people
                who embody strength, ambition, and unrelenting drive.
              </p>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="ghost">Reply</Button>
            </CardFooter>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardDescription className="flex gap-3">
              <p>
                <span>By: </span>
                <span>0x00 </span>
              </p>
              <p> 3 days ago.</p>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>
              Prime Coin is a pioneering cryptocurrency tailored for people who
              embody strength, ambition, and unrelenting drive.
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button className="" variant="ghost">
              Reply
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Thread;
