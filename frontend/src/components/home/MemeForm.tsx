import * as React from "react";
import { cn } from "@/lib/utils";
import { useReadContract, useWriteContract } from "wagmi";
import config from "@/config.json";
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
import { Textarea } from "@/components/ui/textarea";
import { useUploady, useItemFinishListener } from "@rpldy/uploady";
import UploadPreview from "@rpldy/upload-preview";
import { formatEther } from "ethers";

export function MemeForm() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const FormWrapper = isDesktop ? Dialog : Drawer;
  const FormTrigger = isDesktop ? DialogTrigger : DrawerTrigger;
  const FormContent = isDesktop ? DialogContent : DrawerContent;
  const FormHeader = isDesktop ? DialogHeader : DrawerHeader;
  const FormTitle = isDesktop ? DialogTitle : DrawerTitle;
  const FormDescription = isDesktop ? DialogDescription : DrawerDescription;

  return (
    <FormWrapper open={open} onOpenChange={setOpen}>
      <FormTrigger asChild>
        <Button variant="default">Create Meme</Button>
      </FormTrigger>
      <FormContent className="sm:max-w-[425px]">
        <FormHeader>
          <FormTitle>Create Meme</FormTitle>
          <FormDescription>Provide information to create your meme.</FormDescription>
        </FormHeader>
        <ProfileForm />
        {!isDesktop && (
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        )}
      </FormContent>
    </FormWrapper>
  );
}

function ProfileForm({ className }: React.ComponentProps<"form">) {
  const [name, setName] = React.useState("");
  const [ticker, setTicker] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imageUrl, setImageUrl] = React.useState("");
  const [isUploading, setIsUploading] = React.useState(false);

  const { writeContractAsync: mintFunction } = useWriteContract();
  const { data: bnbCost } = useReadContract({
    abi: config.abi,
    address: config.address as `0x${string}`,
    functionName: "creationFee",
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) setImageFile(file);
  };

  const uploadImage = async () => {
    if (!imageFile) {
      alert("Please select an image first!");
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("image", imageFile);

    try {
      const response = await fetch(`${import.meta.env.VITE_REACT_APP_BACKEND}upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Image upload failed!");

      const data = await response.json();
      setImageUrl(data.ipfsHash);
    } catch (error) {
      console.error(error);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const mint = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name || !ticker || !imageUrl) {
      alert("All fields including image upload are required!");
      return;
    }

    try {
      await mintFunction({
        abi: config.abi,
        address: config.address as `0x${string}`,
        functionName: "createMeme",
        args: [name, ticker, description, imageUrl],
        value: BigInt(bnbCost?.toString() || "0"),
      });
      alert("Meme created successfully!");
    } catch (error) {
      console.error("Minting failed:", error);
    }
  };

  return (
    <form className={cn("grid items-start gap-4", className)} onSubmit={mint}>
      <div className="grid gap-2">
        <Label htmlFor="name">Name</Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="ticker">Ticker</Label>
        <Input
          type="text"
          id="ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <p className="text-sm text-muted-foreground">
          Short description about your meme.
        </p>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="image">Upload Image</Label>
        <Input type="file" id="image" accept="image/*" onChange={handleImageChange} />
        {imageUrl.length==0&&<Button
          type="button"
          variant="outline"
          onClick={uploadImage}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Upload"}
        </Button>}
        <p className="text-sm text-muted-foreground">Select an image for your meme.</p>
        {imageUrl && (
          <img src={import.meta.env.VITE_REACT_APP_IPFS_GATEWAY+imageUrl} alt="Uploaded Meme" className="w-32 h-32 object-cover" />
        )}
      </div>
      <div className="text-gray-400 flex items-center gap-2 justify-between">
        <p>Cost:</p>
        <p>{formatEther(bnbCost?.toString() || "0")} BNB</p>
      </div>
      <Button type="submit" disabled={isUploading || !imageUrl}>
        Create
      </Button>
    </form>
  );
}
