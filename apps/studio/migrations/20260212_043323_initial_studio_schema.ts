import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text DEFAULT 'user' NOT NULL,
  	\`plan\` text DEFAULT 'free' NOT NULL,
  	\`stripe_connect_account_id\` text,
  	\`default_organization_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text,
  	FOREIGN KEY (\`default_organization_id\`) REFERENCES \`organizations\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`users_default_organization_idx\` ON \`users\` (\`default_organization_id\`);`)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`projects\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`description\` text,
  	\`domain\` text DEFAULT 'forge' NOT NULL,
  	\`status\` text DEFAULT 'active' NOT NULL,
  	\`owner_id\` integer,
  	\`organization_id\` integer,
  	\`estimated_size_bytes\` numeric DEFAULT 0 NOT NULL,
  	\`forge_graph_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`organization_id\`) REFERENCES \`organizations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`forge_graph_id\`) REFERENCES \`forge_graphs\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`projects_slug_idx\` ON \`projects\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`projects_owner_idx\` ON \`projects\` (\`owner_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_organization_idx\` ON \`projects\` (\`organization_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_forge_graph_idx\` ON \`projects\` (\`forge_graph_id\`);`)
  await db.run(sql`CREATE INDEX \`projects_updated_at_idx\` ON \`projects\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`projects_created_at_idx\` ON \`projects\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`forge_graphs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`project_id\` integer NOT NULL,
  	\`kind\` text NOT NULL,
  	\`title\` text NOT NULL,
  	\`flow\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`forge_graphs_project_idx\` ON \`forge_graphs\` (\`project_id\`);`)
  await db.run(sql`CREATE INDEX \`forge_graphs_kind_idx\` ON \`forge_graphs\` (\`kind\`);`)
  await db.run(sql`CREATE INDEX \`forge_graphs_updated_at_idx\` ON \`forge_graphs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`forge_graphs_created_at_idx\` ON \`forge_graphs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`video_docs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`graph_id\` text,
  	\`doc\` text NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`video_docs_updated_at_idx\` ON \`video_docs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`video_docs_created_at_idx\` ON \`video_docs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`pages\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`project_id\` integer NOT NULL,
  	\`parent\` text DEFAULT '{"type":"workspace","workspace":true}' NOT NULL,
  	\`properties\` text DEFAULT '{}' NOT NULL,
  	\`cover\` text,
  	\`icon\` text,
  	\`archived\` integer DEFAULT false,
  	\`in_trash\` integer DEFAULT false,
  	\`url\` text,
  	\`public_url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`pages_project_idx\` ON \`pages\` (\`project_id\`);`)
  await db.run(sql`CREATE INDEX \`pages_updated_at_idx\` ON \`pages\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`pages_created_at_idx\` ON \`pages\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`blocks\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`page_id\` integer NOT NULL,
  	\`parent_block_id\` integer,
  	\`type\` text NOT NULL,
  	\`position\` numeric DEFAULT 0 NOT NULL,
  	\`payload\` text DEFAULT '{}' NOT NULL,
  	\`archived\` integer DEFAULT false,
  	\`in_trash\` integer DEFAULT false,
  	\`has_children\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`page_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`parent_block_id\`) REFERENCES \`blocks\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`blocks_page_idx\` ON \`blocks\` (\`page_id\`);`)
  await db.run(sql`CREATE INDEX \`blocks_parent_block_idx\` ON \`blocks\` (\`parent_block_id\`);`)
  await db.run(sql`CREATE INDEX \`blocks_type_idx\` ON \`blocks\` (\`type\`);`)
  await db.run(sql`CREATE INDEX \`blocks_updated_at_idx\` ON \`blocks\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`blocks_created_at_idx\` ON \`blocks\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`characters\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`description\` text,
  	\`image_url\` text,
  	\`voice_id\` text,
  	\`avatar_id\` integer,
  	\`project_id\` integer NOT NULL,
  	\`meta\` text,
  	\`archived_at\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`characters_avatar_idx\` ON \`characters\` (\`avatar_id\`);`)
  await db.run(sql`CREATE INDEX \`characters_project_idx\` ON \`characters\` (\`project_id\`);`)
  await db.run(sql`CREATE INDEX \`characters_updated_at_idx\` ON \`characters\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`characters_created_at_idx\` ON \`characters\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`relationships\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`project_id\` integer NOT NULL,
  	\`source_character_id\` integer NOT NULL,
  	\`target_character_id\` integer NOT NULL,
  	\`label\` text NOT NULL,
  	\`description\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`source_character_id\`) REFERENCES \`characters\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`target_character_id\`) REFERENCES \`characters\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`relationships_project_idx\` ON \`relationships\` (\`project_id\`);`)
  await db.run(sql`CREATE INDEX \`relationships_source_character_idx\` ON \`relationships\` (\`source_character_id\`);`)
  await db.run(sql`CREATE INDEX \`relationships_target_character_idx\` ON \`relationships\` (\`target_character_id\`);`)
  await db.run(sql`CREATE INDEX \`relationships_updated_at_idx\` ON \`relationships\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`relationships_created_at_idx\` ON \`relationships\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`media\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`alt\` text,
  	\`organization_id\` integer NOT NULL,
  	\`uploaded_by_user_id\` integer,
  	\`project_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	\`sizes_thumbnail_url\` text,
  	\`sizes_thumbnail_width\` numeric,
  	\`sizes_thumbnail_height\` numeric,
  	\`sizes_thumbnail_mime_type\` text,
  	\`sizes_thumbnail_filesize\` numeric,
  	\`sizes_thumbnail_filename\` text,
  	\`sizes_medium_url\` text,
  	\`sizes_medium_width\` numeric,
  	\`sizes_medium_height\` numeric,
  	\`sizes_medium_mime_type\` text,
  	\`sizes_medium_filesize\` numeric,
  	\`sizes_medium_filename\` text,
  	FOREIGN KEY (\`organization_id\`) REFERENCES \`organizations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`uploaded_by_user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`media_organization_idx\` ON \`media\` (\`organization_id\`);`)
  await db.run(sql`CREATE INDEX \`media_uploaded_by_user_idx\` ON \`media\` (\`uploaded_by_user_id\`);`)
  await db.run(sql`CREATE INDEX \`media_project_idx\` ON \`media\` (\`project_id\`);`)
  await db.run(sql`CREATE INDEX \`media_updated_at_idx\` ON \`media\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`media_created_at_idx\` ON \`media\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_filename_idx\` ON \`media\` (\`filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_thumbnail_sizes_thumbnail_filename_idx\` ON \`media\` (\`sizes_thumbnail_filename\`);`)
  await db.run(sql`CREATE INDEX \`media_sizes_medium_sizes_medium_filename_idx\` ON \`media\` (\`sizes_medium_filename\`);`)
  await db.run(sql`CREATE TABLE \`settings_overrides\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`scope\` text NOT NULL,
  	\`scope_id\` text,
  	\`settings\` text NOT NULL,
  	\`label\` text,
  	\`user_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`settings_overrides_user_idx\` ON \`settings_overrides\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`settings_overrides_updated_at_idx\` ON \`settings_overrides\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`settings_overrides_created_at_idx\` ON \`settings_overrides\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`agent_sessions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`user_id\` integer NOT NULL,
  	\`project_id\` integer NOT NULL,
  	\`editor\` text NOT NULL,
  	\`domain\` text NOT NULL,
  	\`session_key\` text NOT NULL,
  	\`thread_id\` text NOT NULL,
  	\`checkpoint\` text,
  	\`summary\` text,
  	\`events\` text,
  	\`message_count\` numeric DEFAULT 0 NOT NULL,
  	\`last_model_id\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`agent_sessions_user_idx\` ON \`agent_sessions\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`agent_sessions_project_idx\` ON \`agent_sessions\` (\`project_id\`);`)
  await db.run(sql`CREATE INDEX \`agent_sessions_editor_idx\` ON \`agent_sessions\` (\`editor\`);`)
  await db.run(sql`CREATE INDEX \`agent_sessions_domain_idx\` ON \`agent_sessions\` (\`domain\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`agent_sessions_session_key_idx\` ON \`agent_sessions\` (\`session_key\`);`)
  await db.run(sql`CREATE INDEX \`agent_sessions_thread_id_idx\` ON \`agent_sessions\` (\`thread_id\`);`)
  await db.run(sql`CREATE INDEX \`agent_sessions_updated_at_idx\` ON \`agent_sessions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`agent_sessions_created_at_idx\` ON \`agent_sessions\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`waitlist\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`email\` text NOT NULL,
  	\`name\` text,
  	\`source\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`waitlist_updated_at_idx\` ON \`waitlist\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`waitlist_created_at_idx\` ON \`waitlist\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`newsletter_subscribers\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`email\` text NOT NULL,
  	\`opted_in\` integer DEFAULT true NOT NULL,
  	\`source\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`newsletter_subscribers_updated_at_idx\` ON \`newsletter_subscribers\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`newsletter_subscribers_created_at_idx\` ON \`newsletter_subscribers\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`promotions\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`body\` text,
  	\`active\` integer DEFAULT false NOT NULL,
  	\`starts_at\` text,
  	\`ends_at\` text,
  	\`cta_url\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`promotions_updated_at_idx\` ON \`promotions\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`promotions_created_at_idx\` ON \`promotions\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`posts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`excerpt\` text,
  	\`body\` text,
  	\`published_at\` text,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`posts_slug_idx\` ON \`posts\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`posts_updated_at_idx\` ON \`posts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`posts_created_at_idx\` ON \`posts\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`listings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`description\` text,
  	\`play_url\` text,
  	\`listing_type\` text NOT NULL,
  	\`project_id\` integer,
  	\`price\` numeric DEFAULT 0 NOT NULL,
  	\`currency\` text DEFAULT 'USD',
  	\`creator_id\` integer NOT NULL,
  	\`organization_id\` integer,
  	\`thumbnail_id\` integer,
  	\`category\` text,
  	\`status\` text DEFAULT 'draft' NOT NULL,
  	\`clone_mode\` text DEFAULT 'indefinite' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`creator_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`organization_id\`) REFERENCES \`organizations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`thumbnail_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`listings_slug_idx\` ON \`listings\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`listings_project_idx\` ON \`listings\` (\`project_id\`);`)
  await db.run(sql`CREATE INDEX \`listings_creator_idx\` ON \`listings\` (\`creator_id\`);`)
  await db.run(sql`CREATE INDEX \`listings_organization_idx\` ON \`listings\` (\`organization_id\`);`)
  await db.run(sql`CREATE INDEX \`listings_thumbnail_idx\` ON \`listings\` (\`thumbnail_id\`);`)
  await db.run(sql`CREATE INDEX \`listings_updated_at_idx\` ON \`listings\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`listings_created_at_idx\` ON \`listings\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`licenses\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`user_id\` integer NOT NULL,
  	\`listing_id\` integer NOT NULL,
  	\`seller_organization_id\` integer,
  	\`stripe_session_id\` text NOT NULL,
  	\`granted_at\` text NOT NULL,
  	\`version_snapshot_id\` text,
  	\`cloned_project_id_id\` integer,
  	\`amount_cents\` numeric,
  	\`platform_fee_cents\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`listing_id\`) REFERENCES \`listings\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`seller_organization_id\`) REFERENCES \`organizations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`cloned_project_id_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`licenses_user_idx\` ON \`licenses\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`licenses_listing_idx\` ON \`licenses\` (\`listing_id\`);`)
  await db.run(sql`CREATE INDEX \`licenses_seller_organization_idx\` ON \`licenses\` (\`seller_organization_id\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`licenses_stripe_session_id_idx\` ON \`licenses\` (\`stripe_session_id\`);`)
  await db.run(sql`CREATE INDEX \`licenses_cloned_project_id_idx\` ON \`licenses\` (\`cloned_project_id_id\`);`)
  await db.run(sql`CREATE INDEX \`licenses_updated_at_idx\` ON \`licenses\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`licenses_created_at_idx\` ON \`licenses\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`stripeSessionId_idx\` ON \`licenses\` (\`stripe_session_id\`);`)
  await db.run(sql`CREATE TABLE \`organizations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`slug\` text NOT NULL,
  	\`owner_id\` integer NOT NULL,
  	\`stripe_connect_account_id\` text,
  	\`stripe_connect_onboarding_complete\` integer DEFAULT false,
  	\`plan_tier\` text DEFAULT 'free' NOT NULL,
  	\`storage_quota_bytes\` numeric DEFAULT 5368709120 NOT NULL,
  	\`storage_used_bytes\` numeric DEFAULT 0 NOT NULL,
  	\`storage_warning_threshold_percent\` numeric DEFAULT 80 NOT NULL,
  	\`enterprise_source_access\` integer DEFAULT false,
  	\`enterprise_premium_support\` integer DEFAULT false,
  	\`enterprise_custom_editors\` integer DEFAULT false,
  	\`stripe_customer_id\` text,
  	\`last_storage_upgrade_session_id\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`owner_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`organizations_slug_idx\` ON \`organizations\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`organizations_owner_idx\` ON \`organizations\` (\`owner_id\`);`)
  await db.run(sql`CREATE INDEX \`organizations_updated_at_idx\` ON \`organizations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`organizations_created_at_idx\` ON \`organizations\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`organization_memberships\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`organization_id\` integer NOT NULL,
  	\`user_id\` integer NOT NULL,
  	\`role\` text DEFAULT 'member' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`organization_id\`) REFERENCES \`organizations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`organization_memberships_organization_idx\` ON \`organization_memberships\` (\`organization_id\`);`)
  await db.run(sql`CREATE INDEX \`organization_memberships_user_idx\` ON \`organization_memberships\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`organization_memberships_updated_at_idx\` ON \`organization_memberships\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`organization_memberships_created_at_idx\` ON \`organization_memberships\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`organization_user_idx\` ON \`organization_memberships\` (\`organization_id\`,\`user_id\`);`)
  await db.run(sql`CREATE TABLE \`ai_usage_events\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`request_id\` text NOT NULL,
  	\`user_id\` integer NOT NULL,
  	\`organization_id\` integer,
  	\`api_key_id\` integer,
  	\`auth_type\` text DEFAULT 'session' NOT NULL,
  	\`provider\` text NOT NULL,
  	\`model\` text NOT NULL,
  	\`route_key\` text NOT NULL,
  	\`status\` text DEFAULT 'success' NOT NULL,
  	\`error_message\` text,
  	\`input_tokens\` numeric DEFAULT 0 NOT NULL,
  	\`output_tokens\` numeric DEFAULT 0 NOT NULL,
  	\`total_tokens\` numeric DEFAULT 0 NOT NULL,
  	\`input_cost_usd\` numeric DEFAULT 0 NOT NULL,
  	\`output_cost_usd\` numeric DEFAULT 0 NOT NULL,
  	\`total_cost_usd\` numeric DEFAULT 0 NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`organization_id\`) REFERENCES \`organizations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`api_key_id\`) REFERENCES \`api_keys\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`ai_usage_events_request_id_idx\` ON \`ai_usage_events\` (\`request_id\`);`)
  await db.run(sql`CREATE INDEX \`ai_usage_events_user_idx\` ON \`ai_usage_events\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`ai_usage_events_organization_idx\` ON \`ai_usage_events\` (\`organization_id\`);`)
  await db.run(sql`CREATE INDEX \`ai_usage_events_api_key_idx\` ON \`ai_usage_events\` (\`api_key_id\`);`)
  await db.run(sql`CREATE INDEX \`ai_usage_events_updated_at_idx\` ON \`ai_usage_events\` (\`updated_at\`);`)
  await db.run(sql`CREATE TABLE \`api_keys_scopes\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`api_keys\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`api_keys_scopes_order_idx\` ON \`api_keys_scopes\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`api_keys_scopes_parent_idx\` ON \`api_keys_scopes\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`api_keys\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`key_id\` text NOT NULL,
  	\`key_prefix\` text NOT NULL,
  	\`key_last4\` text NOT NULL,
  	\`secret_salt\` text NOT NULL,
  	\`secret_hash\` text NOT NULL,
  	\`user_id\` integer NOT NULL,
  	\`organization_id\` integer NOT NULL,
  	\`expires_at\` text,
  	\`revoked_at\` text,
  	\`revoked_reason\` text,
  	\`created_by_ip\` text,
  	\`last_used_at\` text,
  	\`last_used_ip\` text,
  	\`request_count\` numeric DEFAULT 0 NOT NULL,
  	\`input_tokens\` numeric DEFAULT 0 NOT NULL,
  	\`output_tokens\` numeric DEFAULT 0 NOT NULL,
  	\`total_cost_usd\` numeric DEFAULT 0 NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`organization_id\`) REFERENCES \`organizations\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`api_keys_key_id_idx\` ON \`api_keys\` (\`key_id\`);`)
  await db.run(sql`CREATE INDEX \`api_keys_user_idx\` ON \`api_keys\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`api_keys_organization_idx\` ON \`api_keys\` (\`organization_id\`);`)
  await db.run(sql`CREATE INDEX \`api_keys_updated_at_idx\` ON \`api_keys\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`api_keys_created_at_idx\` ON \`api_keys\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`storage_usage_events\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`organization_id\` integer NOT NULL,
  	\`user_id\` integer,
  	\`project_id\` integer,
  	\`source\` text NOT NULL,
  	\`delta_bytes\` numeric NOT NULL,
  	\`total_after_bytes\` numeric NOT NULL,
  	\`metadata\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`organization_id\`) REFERENCES \`organizations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`project_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`storage_usage_events_organization_idx\` ON \`storage_usage_events\` (\`organization_id\`);`)
  await db.run(sql`CREATE INDEX \`storage_usage_events_user_idx\` ON \`storage_usage_events\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`storage_usage_events_project_idx\` ON \`storage_usage_events\` (\`project_id\`);`)
  await db.run(sql`CREATE INDEX \`storage_usage_events_updated_at_idx\` ON \`storage_usage_events\` (\`updated_at\`);`)
  await db.run(sql`CREATE TABLE \`enterprise_requests\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`organization_id\` integer NOT NULL,
  	\`requested_by_user_id\` integer NOT NULL,
  	\`type\` text NOT NULL,
  	\`status\` text DEFAULT 'open' NOT NULL,
  	\`notes\` text,
  	\`resolved_at\` text,
  	\`resolved_by_id\` integer,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`organization_id\`) REFERENCES \`organizations\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`requested_by_user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`resolved_by_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`enterprise_requests_organization_idx\` ON \`enterprise_requests\` (\`organization_id\`);`)
  await db.run(sql`CREATE INDEX \`enterprise_requests_requested_by_user_idx\` ON \`enterprise_requests\` (\`requested_by_user_id\`);`)
  await db.run(sql`CREATE INDEX \`enterprise_requests_resolved_by_idx\` ON \`enterprise_requests\` (\`resolved_by_id\`);`)
  await db.run(sql`CREATE INDEX \`enterprise_requests_updated_at_idx\` ON \`enterprise_requests\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`enterprise_requests_created_at_idx\` ON \`enterprise_requests\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`projects_id\` integer,
  	\`forge_graphs_id\` integer,
  	\`video_docs_id\` integer,
  	\`pages_id\` integer,
  	\`blocks_id\` integer,
  	\`characters_id\` integer,
  	\`relationships_id\` integer,
  	\`media_id\` integer,
  	\`settings_overrides_id\` integer,
  	\`agent_sessions_id\` integer,
  	\`waitlist_id\` integer,
  	\`newsletter_subscribers_id\` integer,
  	\`promotions_id\` integer,
  	\`posts_id\` integer,
  	\`listings_id\` integer,
  	\`licenses_id\` integer,
  	\`organizations_id\` integer,
  	\`organization_memberships_id\` integer,
  	\`ai_usage_events_id\` integer,
  	\`api_keys_id\` integer,
  	\`storage_usage_events_id\` integer,
  	\`enterprise_requests_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`projects_id\`) REFERENCES \`projects\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`forge_graphs_id\`) REFERENCES \`forge_graphs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`video_docs_id\`) REFERENCES \`video_docs\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`pages_id\`) REFERENCES \`pages\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`blocks_id\`) REFERENCES \`blocks\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`characters_id\`) REFERENCES \`characters\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`relationships_id\`) REFERENCES \`relationships\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`media_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`settings_overrides_id\`) REFERENCES \`settings_overrides\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`agent_sessions_id\`) REFERENCES \`agent_sessions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`waitlist_id\`) REFERENCES \`waitlist\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`newsletter_subscribers_id\`) REFERENCES \`newsletter_subscribers\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`promotions_id\`) REFERENCES \`promotions\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`posts_id\`) REFERENCES \`posts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`listings_id\`) REFERENCES \`listings\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`licenses_id\`) REFERENCES \`licenses\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`organizations_id\`) REFERENCES \`organizations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`organization_memberships_id\`) REFERENCES \`organization_memberships\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`ai_usage_events_id\`) REFERENCES \`ai_usage_events\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`api_keys_id\`) REFERENCES \`api_keys\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`storage_usage_events_id\`) REFERENCES \`storage_usage_events\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`enterprise_requests_id\`) REFERENCES \`enterprise_requests\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_projects_id_idx\` ON \`payload_locked_documents_rels\` (\`projects_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_forge_graphs_id_idx\` ON \`payload_locked_documents_rels\` (\`forge_graphs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_video_docs_id_idx\` ON \`payload_locked_documents_rels\` (\`video_docs_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_pages_id_idx\` ON \`payload_locked_documents_rels\` (\`pages_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_blocks_id_idx\` ON \`payload_locked_documents_rels\` (\`blocks_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_characters_id_idx\` ON \`payload_locked_documents_rels\` (\`characters_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_relationships_id_idx\` ON \`payload_locked_documents_rels\` (\`relationships_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_media_id_idx\` ON \`payload_locked_documents_rels\` (\`media_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_settings_overrides_id_idx\` ON \`payload_locked_documents_rels\` (\`settings_overrides_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_agent_sessions_id_idx\` ON \`payload_locked_documents_rels\` (\`agent_sessions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_waitlist_id_idx\` ON \`payload_locked_documents_rels\` (\`waitlist_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_newsletter_subscribers_id_idx\` ON \`payload_locked_documents_rels\` (\`newsletter_subscribers_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_promotions_id_idx\` ON \`payload_locked_documents_rels\` (\`promotions_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_posts_id_idx\` ON \`payload_locked_documents_rels\` (\`posts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_listings_id_idx\` ON \`payload_locked_documents_rels\` (\`listings_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_licenses_id_idx\` ON \`payload_locked_documents_rels\` (\`licenses_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_organizations_id_idx\` ON \`payload_locked_documents_rels\` (\`organizations_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_organization_memberships_i_idx\` ON \`payload_locked_documents_rels\` (\`organization_memberships_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_ai_usage_events_id_idx\` ON \`payload_locked_documents_rels\` (\`ai_usage_events_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_api_keys_id_idx\` ON \`payload_locked_documents_rels\` (\`api_keys_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_storage_usage_events_id_idx\` ON \`payload_locked_documents_rels\` (\`storage_usage_events_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_enterprise_requests_id_idx\` ON \`payload_locked_documents_rels\` (\`enterprise_requests_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`projects\`;`)
  await db.run(sql`DROP TABLE \`forge_graphs\`;`)
  await db.run(sql`DROP TABLE \`video_docs\`;`)
  await db.run(sql`DROP TABLE \`pages\`;`)
  await db.run(sql`DROP TABLE \`blocks\`;`)
  await db.run(sql`DROP TABLE \`characters\`;`)
  await db.run(sql`DROP TABLE \`relationships\`;`)
  await db.run(sql`DROP TABLE \`media\`;`)
  await db.run(sql`DROP TABLE \`settings_overrides\`;`)
  await db.run(sql`DROP TABLE \`agent_sessions\`;`)
  await db.run(sql`DROP TABLE \`waitlist\`;`)
  await db.run(sql`DROP TABLE \`newsletter_subscribers\`;`)
  await db.run(sql`DROP TABLE \`promotions\`;`)
  await db.run(sql`DROP TABLE \`posts\`;`)
  await db.run(sql`DROP TABLE \`listings\`;`)
  await db.run(sql`DROP TABLE \`licenses\`;`)
  await db.run(sql`DROP TABLE \`organizations\`;`)
  await db.run(sql`DROP TABLE \`organization_memberships\`;`)
  await db.run(sql`DROP TABLE \`ai_usage_events\`;`)
  await db.run(sql`DROP TABLE \`api_keys_scopes\`;`)
  await db.run(sql`DROP TABLE \`api_keys\`;`)
  await db.run(sql`DROP TABLE \`storage_usage_events\`;`)
  await db.run(sql`DROP TABLE \`enterprise_requests\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
}
