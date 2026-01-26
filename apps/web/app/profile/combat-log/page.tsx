/**
 * Combat Log Page
 * View your fight history
 * v0.36.0 - Full Fighting System MVP
 */

"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronDown, ChevronUp, Trophy } from "lucide-react";
import { apiFetch } from "@/lib/apiBase"