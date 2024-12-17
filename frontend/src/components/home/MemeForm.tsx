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
        <Button
          variant="default"
          className="relative group overflow-hidden bg-primary/90 hover:bg-primary/95
                     text-primary-foreground font-medium px-6 h-12
                     shadow-[0_2px_10px_rgba(0,0,0,0.1)]
                     transition-all duration-300 hover:scale-105
                     hover:shadow-[0_0_20px_rgba(5,10,48,0.35)]
                     active:scale-100"
        >
          <span className="relative z-10 flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Meme
          </span>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-primary/80 via-primary to-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Button>
      </FormTrigger>
      <FormContent className="sm:max-w-[425px] max-h-[90vh] flex flex-col">
        <FormHeader className="flex-none">
          <FormTitle>Create Meme</FormTitle>
          <FormDescription>
            Provide information to create your meme.
          </FormDescription>
        </FormHeader>
        
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <ProfileForm />
        </div>
        
        {!isDesktop && (
          <DrawerFooter className="flex-none">
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
    <form 
      className={cn("grid items-start gap-6 pb-6", className)} 
      onSubmit={mint}
    >
      {/* Name Field */}
      <div className="grid gap-2">
        <Label htmlFor="name" className="text-sm font-semibold text-foreground/90">
          Name
        </Label>
        <Input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 bg-background/50 border-border/40 rounded-lg
                    text-foreground placeholder:text-muted-foreground/60
                    focus:ring-2 focus:ring-primary/20 focus:border-primary/30
                    hover:bg-background/70 hover:border-primary/50
                    transition-all duration-300"
          placeholder="Enter meme name..."
        />
      </div>

      {/* Ticker Field */}
      <div className="grid gap-2">
        <Label htmlFor="ticker" className="text-sm font-semibold text-foreground/90">
          Ticker
        </Label>
        <Input
          type="text"
          id="ticker"
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="h-11 bg-background/50 border-border/40 rounded-lg
                    text-foreground placeholder:text-muted-foreground/60
                    focus:ring-2 focus:ring-primary/20 focus:border-primary/30
                    hover:bg-background/70 hover:border-primary/50
                    transition-all duration-300"
          placeholder="Enter token ticker..."
        />
      </div>

      {/* Description Field */}
      <div className="grid gap-2">
        <Label htmlFor="description" className="text-sm font-semibold text-foreground/90">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[100px] bg-background/50 border-border/40 rounded-lg
                    text-foreground placeholder:text-muted-foreground/60
                    focus:ring-2 focus:ring-primary/20 focus:border-primary/30
                    hover:bg-background/70 hover:border-primary/50
                    transition-all duration-300 resize-none"
          placeholder="Tell us about your meme..."
        />
        <p className="text-sm text-muted-foreground/80 italic">
          Provide a short description about your meme token
        </p>
      </div>

      {/* Image Upload Field */}
      <div className="grid gap-3">
        <Label htmlFor="image" className="text-sm font-semibold text-foreground/90">
          Meme Image
        </Label>
        
        <div className="relative group">
          <Input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            className="h-11 bg-background/50 border-border/40 rounded-lg
                      text-foreground placeholder:text-muted-foreground/60
                      focus:ring-2 focus:ring-primary/20 focus:border-primary/30
                      hover:bg-background/70 hover:border-primary/50
                      file:mr-4 file:py-2 file:px-4 file:rounded-md
                      file:border-0 file:text-sm file:font-medium
                      file:bg-primary/10 file:text-primary
                      hover:file:bg-primary/20
                      transition-all duration-300"
          />
        </div>

        {imageUrl.length === 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={uploadImage}
            disabled={isUploading}
            className="w-full h-11 bg-background/50 border-border/40
                      hover:bg-primary/5 hover:border-primary/50
                      hover:shadow-[0_0_10px_rgba(5,10,48,0.25)]
                      transition-all duration-300"
          >
            {isUploading ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Uploading...</span>
              </div>
            ) : (
              "Upload Image"
            )}
          </Button>
        )}

        {imageUrl && (
          <div className="relative rounded-lg overflow-hidden border border-border/40">
            <img
              src={import.meta.env.VITE_REACT_APP_IPFS_GATEWAY + imageUrl}
              alt="Uploaded Meme"
              className="w-full h-48 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}
      </div>

      {/* Cost Display */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm font-medium text-foreground/80">Creation Cost:</p>
        <p className="text-sm font-mono font-semibold text-primary">
          {formatEther(bnbCost?.toString() || "0")} BNB
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isUploading || !imageUrl}
        className="w-full h-12 bg-primary text-primary-foreground
                  hover:bg-primary/90 hover:shadow-[0_0_15px_rgba(5,10,48,0.5)]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  transition-all duration-300"
      >
        Create Meme Token
      </Button>
    </form>
  );
}
