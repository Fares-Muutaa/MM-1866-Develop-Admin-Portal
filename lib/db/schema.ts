import {
  pgTable,
  serial,
  varchar,
  timestamp,
  text,
  pgEnum,
  boolean,
  integer,
  json,
  index,
  numeric,
  date,
  jsonb,
  decimal,
} from "drizzle-orm/pg-core"
import { relations, sql } from "drizzle-orm"

// Users table
export const user_enum_role = pgEnum("role", ["Admin", "User", "Provider", "Supplier", "Viewer"])
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: user_enum_role("role").notNull().default("User"),

  jobTitle: varchar("job_title", { length: 100 }),
  department: varchar("department", { length: 100 }),
  workDomain: varchar("work_domain", { length: 100 }),
  organization: varchar("organization", { length: 255 }),
  bio: text("bio"),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deleted_at: timestamp("deleted_at"),
  resetpasswordtoken: varchar("resetpasswordtoken"),
  passwordresettokenexpiry: timestamp("passwordresettokenexpiry"),
  passwordupdatedat: timestamp("passwordupdatedat"),
  isDisabled: boolean("isDisabled"),
  last_login: timestamp("last_login"),
  deactivated_at: timestamp("deactivated_at"),
})

// CASL PERMISSION TABLES
// ==============================

// Roles table
export const roles = pgTable("roles", {
  role_id: serial("role_id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: varchar("description", { length: 255 }),
  is_builtin: boolean("is_builtin").default(false),
  created_at: timestamp("created_at").defaultNow(),
})

// Permission scope enum
export const permissionScopeEnum = pgEnum("permission_scope", ["global", "tenant", "resource"])

// Permission table
export const permission = pgTable("permission", {
  permission_id: serial("permission_id").primaryKey(),
  domain: varchar("domain", { length: 100 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(),
  scope: permissionScopeEnum("scope"),
  description: varchar("description", { length: 255 }),
})

// User Role table
export const userRole = pgTable(
  "user_role",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role_id: integer("role_id")
      .notNull()
      .references(() => roles.role_id, { onDelete: "cascade" }),
    granted_at: timestamp("granted_at").defaultNow(),
    granted_by: integer("granted_by"),
  },
  (table) => ({
    userRoleUnique: index("user_role_unique").on(table.user_id, table.role_id),
  }),
)

// Role Permission table
export const rolePermission = pgTable(
  "role_permission",
  {
    id: serial("id").primaryKey(),
    role_id: integer("role_id")
      .notNull()
      .references(() => roles.role_id, { onDelete: "cascade" }),
    permission_id: integer("permission_id")
      .notNull()
      .references(() => permission.permission_id, { onDelete: "cascade" }),
    constraints: jsonb("constraints"),
  },
  (table) => ({
    rolePermissionUnique: index("role_permission_unique").on(table.role_id, table.permission_id),
  }),
)

// User Permission table
export const userPermission = pgTable(
  "user_permission",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    permission_id: integer("permission_id")
      .notNull()
      .references(() => permission.permission_id, { onDelete: "cascade" }),
    constraints: jsonb("constraints"),
    revoked: boolean("revoked").default(false),
  },
  (table) => ({
    userPermissionUnique: index("user_permission_unique").on(table.user_id, table.permission_id),
  }),
)

// Alert Status Enum
export const alertStatusEnum = pgEnum("alert_status", ["active", "acknowledged", "resolved", "snoozed", "dismissed"])

// Alert KPIs table
export const alertKpis = pgTable("alert_kpis", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
})

// Alert Templates table
export const alertTemplates = pgTable("alert_templates", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull(),
  description: text("description"),
  messageEn: text("messageen"),
  kpiId: integer("kpi_id").references(() => alertKpis.id),
})

// Alert Template Fields table
export const alertTemplateFields = pgTable("alert_template_fields", {
  id: serial("id").primaryKey(),
  alertTemplateId: integer("alert_template_id").references(() => alertTemplates.id),
  name: varchar("name", { length: 50 }).notNull(),
  datatype: varchar("datatype", { length: 20 }),
  description: text("description"),
  columnOrder: integer("column_order"),
  isRequired: boolean("is_required"),
})

// Alerts table

// Alerts table - Updated with enum
export const alerts = pgTable("alerts", {
  id: integer("id").primaryKey().default(sql`nextval('alerts_id_seq')`),
  alertTemplateId: integer("alert_template_id").references(() => alertTemplates.id),
  status: alertStatusEnum("status").notNull().default("active"),
  severity: varchar("severity", { length: 20 }),
  triggeredAt: timestamp("triggered_at"),
  resolvedAt: timestamp("resolved_at"),
  createdBy: integer("created_by"),
})

// Alert Field Values table
export const alertFieldValues = pgTable("alert_field_values", {
  id: serial("id").primaryKey(),
  alertId: integer("alert_id").references(() => alerts.id),
  fieldId: integer("field_id").references(() => alertTemplateFields.id),
  value: text("value"),
})

// Alert Comments table - Updated to include status
export const alertComments = pgTable("alert_comments", {
  id: serial("id").primaryKey(),
  alertId: integer("alert_id").references(() => alerts.id),
  updatedStatus: alertStatusEnum("updated_status"),
  comment: text("comment"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  createdBy: integer("created_by"),
})
export const audit_log = pgTable("audit_log", {
  id: serial("id").notNull(),
  timestamp: timestamp("timestamp", { mode: "string" }).notNull(),
  actor: varchar("actor", { length: 255 }).notNull(),
  event: varchar("event", { length: 255 }).notNull(),
  event_description: text("event_description").notNull(),
  targets: json("targets").notNull(),
  client: json("client"),
})

export const twoFactorAuth = pgTable("two_factor_auth", {
  // One-to-one relation with users table

  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id),

  // Token for confirming 2FA actions (e.g., email/SMS code)
  twoFactorToken: varchar("two_factor_token", { length: 255 }),

  // Expiry for the above token
  twoFactorTokenExpiry: timestamp("two_factor_token_expiry"),

  // Secret key used by TOTP generators (Google Authenticator, Authy, etc.)
  totpSecret: varchar("totp_secret", { length: 255 }),

  // Toggle indicating whether 2FA is enabled for this user
  isTwoFactorEnabled: boolean("is_two_factor_enabled").notNull().default(false),
})

// Export types
export type UserType = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type typenotifications = typeof notifications.$inferInsert

export type RoleType = typeof roles.$inferSelect
export type PermissionType = typeof permission.$inferSelect
export type UserRoleType = typeof userRole.$inferSelect
export type RolePermissionType = typeof rolePermission.$inferSelect
export type UserPermissionType = typeof userPermission.$inferSelect

// Users table

// ForecastExecutions table - NOUVELLE TABLE
export const forecastExecutions = pgTable("forecast_executions", {
  id: serial("id").primaryKey(),
  dateExecution: timestamp("execution_date").notNull().defaultNow(),
  forecast_type_id: integer("forecast_type_id").references(() => forecastTypes.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  created_by: integer("created_by").references(() => users.id),
})

// ForecastTypes table
export const forecastTypes = pgTable("forecast_types", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  isEditable: boolean("is_editable").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdBy: integer("created_by"),
  updatedBy: integer("updated_by"),
  color: varchar("color", { length: 10 }),
  lineType: varchar("line_type", { length: 20 }),
})

// ClassificationLevels table
export const classificationLevels = pgTable("classification_levels", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
})

// Classifications table
export const classifications = pgTable("classifications", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull().unique(),
  description: text("description"),
  level: integer("level").references(() => classificationLevels.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  createdBy: integer("created_by"),
  updatedBy: integer("updated_by"),
  deletedBy: integer("deleted_by"),
  deletedAt: timestamp("deleted_at"),
})

// Products table
export const products = pgTable(
  //NOSONAR
  "products",
  {
    id: serial("id").primaryKey(),
    name: varchar("name").notNull().unique(),
    description: text("description"),
    classificationId: integer("classification_id").references(() => classifications.id),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    deletedAt: timestamp("deleted_at"),
    createdBy: integer("created_by"),
    updatedBy: integer("updated_by"),
    deletedBy: integer("deleted_by"),
  },
  (table) => {
    return {
      classificationIdIdx: index("idx_products_classification_id").on(table.classificationId),
    }
  },
)

// ForecastData table - MODIFIÉE avec forecast_execution_id
export const forecastData = pgTable(
  //NOSONAR
  "forecast_data",
  {
    id: serial("id").primaryKey(),
    type: varchar("type", { length: 10 }).notNull(),
    forecastTypeId: integer("forecast_type_id")
      .notNull()
      .references(() => forecastTypes.id),
    classificationId: integer("classification_id").references(() => classifications.id),
    productId: integer("product_id").references(() => products.id),
    forecastExecutionId: integer("forecast_execution_id").references(() => forecastExecutions.id), // NOUVEAU CHAMP
    date: date("date").notNull(),
    value: numeric("value").notNull(),
    forecast_lower: numeric("forecast_lower"),
    forecast_upper: numeric("forecast_upper"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    createdBy: integer("created_by"),
    updatedBy: integer("updated_by"),
  },
  (table) => {
    return {
      forecastTypeIdIdx: index("idx_forecast_data_forecast_type_id").on(table.forecastTypeId),
      typeIdx: index("idx_forecast_data_type").on(table.type),
      productDateIdx: index("idx_forecast_data_product_date").on(table.productId, table.date),
      classificationDateIdx: index("idx_forecast_data_classification_date").on(table.classificationId, table.date),
      forecastExecutionIdIdx: index("idx_forecast_data_execution_id").on(table.forecastExecutionId), // NOUVEL INDEX
    }
  },
)

// Relations
// Alert relations
export const alertKpisRelations = relations(alertKpis, ({ many }) => ({
  templates: many(alertTemplates),
}))

export const alertTemplatesRelations = relations(alertTemplates, ({ one, many }) => ({
  kpi: one(alertKpis, {
    fields: [alertTemplates.kpiId],
    references: [alertKpis.id],
  }),
  fields: many(alertTemplateFields),
  alerts: many(alerts),
}))

export const alertTemplateFieldsRelations = relations(alertTemplateFields, ({ one, many }) => ({
  template: one(alertTemplates, {
    fields: [alertTemplateFields.alertTemplateId],
    references: [alertTemplates.id],
  }),
  values: many(alertFieldValues),
}))

export const alertsRelations = relations(alerts, ({ one, many }) => ({
  template: one(alertTemplates, {
    fields: [alerts.alertTemplateId],
    references: [alertTemplates.id],
  }),
  fieldValues: many(alertFieldValues),
  comments: many(alertComments),
}))

export const alertFieldValuesRelations = relations(alertFieldValues, ({ one }) => ({
  alert: one(alerts, {
    fields: [alertFieldValues.alertId],
    references: [alerts.id],
  }),
  field: one(alertTemplateFields, {
    fields: [alertFieldValues.fieldId],
    references: [alertTemplateFields.id],
  }),
}))

export const alertCommentsRelations = relations(alertComments, ({ one }) => ({
  alert: one(alerts, {
    fields: [alertComments.alertId],
    references: [alerts.id],
  }),
}))

// CASL permission relations
export const rolesRelations = relations(roles, ({ many }) => ({
  userRoles: many(userRole),
  rolePermissions: many(rolePermission),
}))

export const permissionRelations = relations(permission, ({ many }) => ({
  rolePermissions: many(rolePermission),
  userPermissions: many(userPermission),
}))

export const userRoleRelations = relations(userRole, ({ one }) => ({
  user: one(users, {
    fields: [userRole.user_id],
    references: [users.id],
  }),
  role: one(roles, {
    fields: [userRole.role_id],
    references: [roles.role_id],
  }),
}))

export const rolePermissionRelations = relations(rolePermission, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermission.role_id],
    references: [roles.role_id],
  }),
  permission: one(permission, {
    fields: [rolePermission.permission_id],
    references: [permission.permission_id],
  }),
}))

export const userPermissionRelations = relations(userPermission, ({ one }) => ({
  user: one(users, {
    fields: [userPermission.user_id],
    references: [users.id],
  }),
  permission: one(permission, {
    fields: [userPermission.permission_id],
    references: [permission.permission_id],
  }),
}))

export const forecastExecutionsRelations = relations(forecastExecutions, ({ many }) => ({
  forecastData: many(forecastData),
}))

export const productsRelations = relations(products, ({ one }) => ({
  classification: one(classifications, {
    fields: [products.classificationId],
    references: [classifications.id],
  }),
}))

export const forecastDataRelations = relations(forecastData, ({ one }) => ({
  product: one(products, {
    fields: [forecastData.productId],
    references: [products.id],
  }),
  classification: one(classifications, {
    fields: [forecastData.classificationId],
    references: [classifications.id],
  }),
  forecastType: one(forecastTypes, {
    fields: [forecastData.forecastTypeId],
    references: [forecastTypes.id],
  }),
  forecastExecution: one(forecastExecutions, {
    // NOUVELLE RELATION
    fields: [forecastData.forecastExecutionId],
    references: [forecastExecutions.id],
  }),
}))

export const classificationsRelations = relations(classifications, ({ one }) => ({
  level: one(classificationLevels, {
    fields: [classifications.level],
    references: [classificationLevels.id],
  }),
}))
// Notification types table
export const notificationTypes = pgTable("notification_types", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon"),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// User notification settings table
export const userNotificationSettings = pgTable("user_notification_settings", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  channel_preference: text("channel_preference").notNull(), // mail/email/user/inbox
})

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id),
  type_id: integer("type_id")
    .notNull()
    .references(() => notificationTypes.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  redirect_url: text("redirect_url"),
  data: jsonb("data"),
  read_at: timestamp("read_at"),
  created_at: timestamp("created_at").defaultNow().notNull(),
})

// Upload Configurations Table
export const uploadConfigurations = pgTable("upload_configurations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  organizationType: varchar("organization_type", { length: 100 }),
  // organizationId: integer("organization_id").references(() => organizationTypes.id),
  sourceType: varchar("source_type", { length: 100 }),
  fileType: varchar("file_type", { length: 100 }).notNull(),
  delimiter: varchar("delimiter", { length: 10 }),
  maxFileSize: integer("max_file_size"),
  maxRows: integer("max_rows"),
  storageConfigId: integer("storage_config_id").references(() => uploadStorageConfigurations.id),
  allowPartialUpload: boolean("allow_partial_upload").default(false).notNull(),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
})

// Upload Configuration Columns Table
export const uploadConfigurationColumns = pgTable("upload_configuration_columns", {
  id: serial("id").primaryKey(),
  configId: integer("config_id").references(() => uploadConfigurations.id),
  name: varchar("name", { length: 255 }).notNull(),
  displayName: varchar("display_name", { length: 255 }).notNull(),
  dataType: varchar("data_type", { length: 50 }).notNull(),
  required: boolean("required").default(false).notNull(),
  valuesRequired: boolean("valuesRequired").default(false).notNull(),
  pattern: varchar("pattern", { length: 500 }),
  minLength: integer("min_length"),
  maxLength: integer("max_length"),
  minValue: decimal("min_value"),
  maxValue: decimal("max_value"),
  customValidator: text("custom_validator"),
  position: integer("position").notNull(),
})

// Upload Storage Configurations Table
export const uploadStorageConfigurations = pgTable(
  "upload_storage_configurations",
  {
    //NOSONAR
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    storageType: varchar("storage_type", { length: 50 }).notNull(),
    bucketName: varchar("bucket_name", { length: 255 }),
    basePath: varchar("base_path", { length: 500 }).notNull(),
    pathTemplate: varchar("path_template", { length: 500 }).notNull(),
    region: varchar("region", { length: 100 }),
    awsAccessKeyId: varchar("aws_access_key_id", { length: 255 }),
    awsSecretAccessKey: varchar("aws_secret_access_key", { length: 255 }),
    accessType: varchar("access_type", { length: 20 }),
    containerName: varchar("container_name", { length: 255 }),
    gcsProjectId: varchar("gcs_project_id", { length: 255 }),
    gcsKeyFilename: varchar("gcs_key_filename", { length: 255 }),
    gcsCredentials: jsonb("gcs_credentials"),
    azureAccountName: varchar("azure_account_name", { length: 255 }),
    azureAccountKey: varchar("azure_account_key", { length: 255 }),
    azureSasToken: varchar("azure_sas_token", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  // index the storage_type column for faster lookups
  (table) => {
    return {
      storageTypeIdx: index("idx_upload_storage_configurations_storage_type").on(table.storageType),
    }
  },
)

// Upload Operations Table
export const uploadOperations = pgTable(
  "upload_operations",
  {
    //NOSONAR
    id: serial("id").primaryKey(),
    configId: integer("config_id").references(() => uploadConfigurations.id),
    userId: integer("user_id").references(() => users.id),
    fileName: varchar("file_name", { length: 255 }).notNull(),
    filePath: varchar("file_path", { length: 1000 }).notNull(),
    fileSize: integer("file_size").notNull(),
    rowCount: integer("row_count").notNull(),
    status: varchar("status", { length: 50 }).notNull(),
    errorCount: integer("error_count").default(0).notNull(),
    validationErrors: jsonb("validation_errors"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    deletedAt: timestamp("deleted_at"),
  },
  // Add index on file_path for upload operations file path for faster lookups
  (table) => {
    return {
      filePathIdx: index("idx_upload_operations_file_path").on(table.filePath),
    }
  },
)

// Upload Operation Errors Table
export const uploadOperationErrors = pgTable("upload_operation_errors", {
  id: serial("id").primaryKey(),
  operationId: integer("operation_id").references(() => uploadOperations.id),
  rowNumber: integer("row_number"),
  columnName: varchar("column_name", { length: 255 }),
  errorCode: varchar("error_code", { length: 100 }).notNull(),
  errorMessage: text("error_message").notNull(),
  rawValue: text("raw_value"),
})

// Organization Types Table (for reference data)
export const organizationTypes = pgTable("organization_types", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  sourceTypes: jsonb("source_types").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
})

// Relations
export const uploadConfigurationsRelations = relations(uploadConfigurations, ({ many, one }) => ({
  columns: many(uploadConfigurationColumns),
  storageConfig: one(uploadStorageConfigurations, {
    fields: [uploadConfigurations.storageConfigId],
    references: [uploadStorageConfigurations.id],
  }),
  operations: many(uploadOperations),
}))

export const uploadConfigurationColumnsRelations = relations(uploadConfigurationColumns, ({ one }) => ({
  config: one(uploadConfigurations, {
    fields: [uploadConfigurationColumns.configId],
    references: [uploadConfigurations.id],
  }),
}))

export const uploadStorageConfigurationsRelations = relations(uploadStorageConfigurations, ({ many }) => ({
  configurations: many(uploadConfigurations),
}))

export const uploadOperationsRelations = relations(uploadOperations, ({ one, many }) => ({
  config: one(uploadConfigurations, {
    fields: [uploadOperations.configId],
    references: [uploadConfigurations.id],
  }),
  errors: many(uploadOperationErrors),
}))

export const uploadOperationErrorsRelations = relations(uploadOperationErrors, ({ one }) => ({
  operation: one(uploadOperations, {
    fields: [uploadOperationErrors.operationId],
    references: [uploadOperations.id],
  }),
}))

export type UploadConfigurationType = typeof uploadConfigurations.$inferSelect
export type NewUploadConfiguration = typeof uploadConfigurations.$inferInsert
export type UploadConfigurationColumnType = typeof uploadConfigurationColumns.$inferSelect
export type AuditLog2 = typeof audit_log.$inferSelect
export type NewUploadConfigurationColumn = typeof uploadConfigurationColumns.$inferInsert
export type UploadStorageConfigurationType = typeof uploadStorageConfigurations.$inferSelect
export type NewUploadStorageConfiguration = typeof uploadStorageConfigurations.$inferInsert
export type UploadOperationType = typeof uploadOperations.$inferSelect
export type NewUploadOperation = typeof uploadOperations.$inferInsert
export type UploadOperationErrorType = typeof uploadOperationErrors.$inferSelect
export type NewUploadOperationError = typeof uploadOperationErrors.$inferInsert
