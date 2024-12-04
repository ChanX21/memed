import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function TradeForm() {
  return (
    <Tabs defaultValue="buy" className="w-full h-full ">
      <TabsList className="grid w-full grid-cols-2 h-[10%]">
        <TabsTrigger value="buy" className="h-full">
          Buy
        </TabsTrigger>
        <TabsTrigger value="sell" className="h-full">
          Sell
        </TabsTrigger>
      </TabsList>
      <TabsContent value="buy" className="h-[90%]">
        <Card className="h-full">
          <CardHeader className="h-[30%]">
            <CardTitle>Buy</CardTitle>
            <CardDescription>Trade BNB token for DogeCoin</CardDescription>
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="h-7 flex items-center">
                    set max slippage
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Slippage settings</DialogTitle>
                    <DialogDescription>
                      Make changes for the trade you are about to make
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid items-center gap-4">
                      <Label htmlFor="name" className="">
                        max. slippage (%)
                      </Label>
                      <Input id="name" className="border" />
                    </div>
                    <div className="grid items-center gap-4">
                      <Label htmlFor="name" className="">
                        priority fee
                      </Label>
                      <Input id="name" className="border" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 px-5 h-[50%] ">
            <div className="text-gray-400 flex items-center gap-2 h-[20%] justify-between">
              <p> Balance: </p>
              <p> 0.00 BNB </p>
            </div>
            <div className="space-y-1 h-[50%] bg-gray-500 rounded-xl">
              <Label
                htmlFor="amount"
                className=" h-[30%] text-gray-800 flex items-center p-3"
              >
                Amount ( BNB )
              </Label>
              <Input
                id="amount"
                placeholder="0.00"
                className="h-[70%] text-3xl "
              />
            </div>

            <div className="text-gray-400 flex items-center gap-2 h-[20%] justify-between">
              <p> Matching Dogecoin: </p>
              <p> 0.00 </p>
            </div>
          </CardContent>
          <CardFooter className="h-[20%]">
            <Button className="w-full">Buy</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="sell" className="h-[90%]">
        <Card className="h-full">
          <CardHeader className="h-[30%]">
            <CardTitle>Sell</CardTitle>
            <CardDescription>Trade Dogecoin token for BNB</CardDescription>
            <div className="flex justify-end">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="secondary" className="h-7 flex items-center">
                    set max slippage
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Slippage settings</DialogTitle>
                    <DialogDescription>
                      Make changes for the trade you are about to make
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid items-center gap-4">
                      <Label htmlFor="name" className="">
                        max. slippage (%)
                      </Label>
                      <Input id="name" className="border" />
                    </div>
                    <div className="grid items-center gap-4">
                      <Label htmlFor="name" className="">
                        priority fee
                      </Label>
                      <Input id="name" className="border" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Save changes</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 px-5 h-[50%] ">
            <div className="text-gray-400 flex items-center gap-2 h-[20%] justify-between">
              <p> Balance: </p>
              <p> 0.00 Dogecoin </p>
            </div>
            <div className="space-y-1 h-[60%] bg-gray-500 rounded-xl">
              <Label
                htmlFor="amount"
                className=" h-[30%] text-gray-800 flex items-center p-3"
              >
                Amount ( Dogecoin )
              </Label>
              <Input
                id="amount"
                placeholder="0.00"
                className="h-[70%] text-3xl "
              />
            </div>

            <div className="text-gray-400 flex items-center gap-2 h-[20%] justify-between">
              <p> Matching BNB: </p>
              <p> 0.00 </p>
            </div>
          </CardContent>
          <CardFooter className="h-[20%]">
            <Button variant={"destructive"} className="w-full">
              Sell
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
