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
import { useToast } from "@/hooks/use-toast";

export function MemeForm() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { toast } = useToast();

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
          <FormDescription>
            Provide information to create your meme.
          </FormDescription>
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
  const { toast } = useToast();

  //read bnb const for token creation
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
  // Function to handle image upload
  const uploadImage = async () => {
    // Check if the user has selected an image file
    if (!imageFile) {
      // Display a toast message if no image is selected
      toast({
        variant: "destructive", // Style the toast as an error
        title: "Uh oh! Something went wrong.", // Title of the error message
        description: "Please select an image first!", // Description of the error
      });
      return; // Exit the function if no image is selected
    }

    // Set the uploading state to true to indicate image upload is in progress
    setIsUploading(true);

    // Create a new FormData object to send the image file in the request
    const formData = new FormData();
    formData.append("image", imageFile); // Append the selected image file to the form data

    try {
      // Send a POST request to upload the image to the backend
      const response = await fetch(
        `${import.meta.env.VITE_REACT_APP_BACKEND}upload`, // Use environment variable for backend URL
        {
          method: "POST", // Specify POST method
          body: formData, // Attach form data containing the image file
        },
      );

      // Check if the response is not ok (i.e., the upload failed)
      if (!response.ok) throw new Error("Image upload failed!");

      // Parse the JSON response from the backend
      const data = await response.json();
      setImageUrl(data.ipfsHash); // Set the image URL from the response (IPFS hash)
    } catch (error) {
      // Log any errors that occur during the upload process
      console.error(error);
      // Display a toast message with an error description
      toast({
        variant: "destructive", // Style the toast as an error
        title: "Uh oh! Something went wrong.", // Title of the error message
        description: "Failed to upload image.", // Description of the error
      });
    } finally {
      // Set the uploading state to false once the upload is complete (either success or failure)
      setIsUploading(false);
    }
  };

  // Function to handle the minting process when the form is submitted
  const mint = async (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent the default form submission behavior
    e.preventDefault();

    // Check if all required fields are filled (name, ticker, and imageUrl)
    if (!name || !ticker || !imageUrl) {
      // Display a toast message if any field is missing (this line is missing the toast call)
      console.log("All fields including image upload are required!"); // Add a toast here to notify the user
      return; // Exit the function if any field is missing
    }

    try {
      // Call the mintFunction to interact with the blockchain
      await mintFunction({
        abi: config.abi, // Contract ABI to interact with the smart contract
        address: config.address as `0x${string}`, // Contract address (ensured to be a valid Ethereum address)
        functionName: "createMeme", // The function in the smart contract that will be called
        args: [name, ticker, description, imageUrl], // Arguments for the contract function
        value: BigInt(bnbCost?.toString() || "0"), // Convert the BNB cost to BigInt and send it as value
      });

      // Display a toast message upon successful minting
      toast({
        description: "Meme created successfully!", // Success message
      });
    } catch (error) {
      // Log any errors that occur during the minting process
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
          className="border"
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="ticker">Ticker</Label>
        <Input
          type="text"
          id="ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="border"
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
        <Input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
        />
        {imageUrl.length == 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={uploadImage}
            disabled={isUploading}
          >
            {isUploading ? "Uploading..." : "Upload"}
          </Button>
        )}
        <p className="text-sm text-muted-foreground">
          Select an image for your meme.
        </p>
        {imageUrl && (
          <img
            src={import.meta.env.VITE_REACT_APP_IPFS_GATEWAY + imageUrl}
            alt="Uploaded Meme"
            className="w-32 h-32 object-cover"
          />
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
