import { Button } from "@/components/ui/button";

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

import { useState } from "react";
import { TradeForm } from "./tradeForm";

export function MobileForm() {
  const [open, setOpen] = useState(false);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <div className="fixed left-0 w-full z-20  m-auto lg:hidden bottom-0 p-2 bg-black">
          <Button className="w-full">Trade</Button>
        </div>
      </DrawerTrigger>
      <DrawerContent>
        <TradeForm />
      </DrawerContent>
    </Drawer>
  );
}
