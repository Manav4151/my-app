import * as z from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const forgetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
export const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export const signupSchema = z
  .object({
    name: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });
export const baseProjectFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum([
    "human_translation",
    "post_editing",
    "text_classification",
    "sequence_tagging",
    "literary_translation",
    "error_marking",
    "translation_rating",
  ]),
  fileContent: z.array(z.string()).optional(),
  startDate: z.date(),
  dueDate: z.date(),
  sourceLanguage: z.string().min(1, "Source language is required"),
  targetLanguage: z.string().optional(),
  labels: z.array(z.string()).optional(),
  confidenceThreshold: z.number().min(0).max(100).optional(),
  errorCategories: z.array(z.string()).optional(),
  ratingFramework: z
    .enum(["fluency", "adequacy", "da", "sqm", "custom"])
    .optional(),
  customCategories: z
    .array(
      z.object({
        id: z.string(),
        label: z.string(),
        description: z.string(),
      })
    )
    .optional(),
  assignedUsers: z.array(z.string()).default([]),
  priority: z.enum(["low", "medium", "high"]).optional(),
  ratePerTask: z.number().min(0).optional(),
  agentId: z.string().optional(),
});
export const agentFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export const projectFormSchema = baseProjectFormSchema
  .refine(
    (data) => {
      // For classification projects, require labels
      if (
        data.type === "text_classification" ||
        data.type === "sequence_tagging"
      ) {
        return (
          data.labels &&
          data.labels.length > 0 &&
          data.labels.every((label) => label.trim() !== "")
        );
      }
      return true;
    },
    {
      message: "At least one label is required for classification projects",
      path: ["labels"],
    }
  )
  .refine(
    (data) => {
      // For error marking projects, require error categories
      if (data.type === "error_marking") {
        return (
          data.errorCategories &&
          data.errorCategories.length > 0 &&
          data.errorCategories.every((cat) => cat.trim() !== "")
        );
      }
      return true;
    },
    {
      message:
        "At least one error category is required for error marking projects",
      path: ["errorCategories"],
    }
  )
  .refine(
    (data) => {
      // For translation rating projects, require rating framework
      if (data.type === "translation_rating") {
        return !!data.ratingFramework;
      }
      return true;
    },
    {
      message: "Rating framework is required for translation rating projects",
      path: ["ratingFramework"],
    }
  )
  .refine(
    (data) => {
      // For custom framework, require at least one category
      if (
        data.type === "translation_rating" &&
        data.ratingFramework === "custom"
      ) {
        return data.customCategories && data.customCategories.length > 0;
      }
      return true;
    },
    {
      message: "At least one category is required for custom rating framework",
      path: ["customCategories"],
    }
  )
  .refine(
    (data) => {
      if (
        [
          "human_translation",
          "post_editing",
          "literary_translation",
          "translation_rating",
        ].includes(data.type)
      ) {
        return !!data.targetLanguage;
      }
      return true;
    },
    {
      message: "Target language is required for translation projects",
      path: ["targetLanguage"],
    }
  )
  .refine(
    (data) => {
      if (
        ["text_classification", "sequence_tagging", "error_marking"].includes(
          data.type
        )
      ) {
        return !data.targetLanguage;
      }
      return true;
    },
    {
      message: "Target language should not be set for classification projects",
      path: ["targetLanguage"],
    }
  )
  .refine(
    (data) => {
      return data.dueDate >= data.startDate;
    },
    {
      message: "Due date must be after start date",
      path: ["dueDate"],
    }
  );

export const taskFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  text: z.array(z.string()).optional(),
  projectId: z.string().optional(),
  assignedTo: z.string().optional(),
  status: z
    .enum(["pending", "in_progress", "completed", "review", "rejected"])
    .default("pending")
    .optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium").optional(),
  // classificationData: z.record(z.unknown()).optional(),
  dueDate: z.date().optional(),
  fileContent: z.array(z.string()).optional(),
});
