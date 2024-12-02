import * as React from "react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@custom-react-hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "../ui/textarea";
import {
  useUploady,
  useItemFinishListener,
  useItemProgressListener,
} from "@rpldy/uploady";
import UploadPreview from "@rpldy/upload-preview";

export function MemeForm() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="default">Create Meme</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create Meme</DialogTitle>
            <DialogDescription>
              Provide informations required to create your meme.
            </DialogDescription>
          </DialogHeader>
          <ProfileForm />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="default">Create Meme</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle> Create Meme</DrawerTitle>
          <DrawerDescription>
            Provide informations required to create your meme.
          </DrawerDescription>
        </DrawerHeader>
        <ProfileForm className="px-4" />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}

function ProfileForm({ className }: React.ComponentProps<"form">) {
  const uploady = useUploady();
  const startUpload = () => {
    uploady.showFileUpload();
  };

  useItemFinishListener((item) => {
    console.log(
      `item ${item.id} finished uploading, response was: `,
      item.uploadResponse,
      item.uploadStatus,
    );
  });

  useItemProgressListener((item) => {
    console.log(
      `>>>>> (hook) File ${item.file.name} completed: ${item.completed}`,
    );
  });
  return (
    <form className={cn("grid items-start gap-4", className)}>
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input type="text" id="name" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="name">Ticker</Label>
        <Input type="text" id="name" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" />
        <p className="text-sm text-muted-foreground">
          Short description about your meme.
        </p>
      </div>
      <div className="grid gap-2">
        <Button type="button" variant="outline" onClick={startUpload}>
          {" "}
          Upload{" "}
        </Button>
        <p className="text-sm text-muted-foreground">
          Select an image for your meme .
        </p>
        <UploadPreview fallbackUrl="https://icon-library.net/images/image-placeholder-icon/image-placeholder-icon-6.jpg" />
      </div>
      <Button type="submit">Create</Button>
    </form>
  );
}
