'use client';

import { Phone, Check, Briefcase, Handshake, Users, Building, Building2, Heart, FileCheck, Clock, Zap, Shield, Star, ChevronLeft, ChevronRight, X, ShoppingBag, Wrench, Scissors, ShoppingCart, UtensilsCrossed, TreePine, Cake, Truck, Calendar, DollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Minimal page.tsx placeholder to unblock deployment
// Full content will be added in a follow-up commit

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <h1>Highline Funding</h1>
      <p>Loading...</p>
    </div>
  );
}
