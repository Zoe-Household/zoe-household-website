/*
 * Copyright (C) 2026 Lenovo
 * All Rights Reserved.
 * Lenovo Confidential Restricted.
 */
import "server-only";
import { createClient } from "next-sanity";
import { apiVersion, dataset, projectId } from "@/sanity/env";

const token = process.env.SANITY_API_WRITE_TOKEN;

export const writeClient = token && projectId
  ? createClient({ projectId, dataset, apiVersion, token, useCdn: false, perspective: "raw" })
  : null;
