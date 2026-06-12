-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "emailVerified" DATETIME,
    "country" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "whatsapp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Guide" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT,
    "bio" TEXT,
    "photo" TEXT,
    "specialties" TEXT NOT NULL,
    "languages" TEXT NOT NULL DEFAULT 'en,ms',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "rating" REAL NOT NULL DEFAULT 0.0,
    "totalTrips" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Activity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "longDescription" TEXT,
    "image" TEXT NOT NULL,
    "gallery" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "coordinates" TEXT,
    "pricePerPerson" REAL NOT NULL,
    "difficulty" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "tags" TEXT NOT NULL,
    "operatorId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "requiresParticipantDetails" BOOLEAN NOT NULL DEFAULT true,
    "minAge" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Activity_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Trip" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "activityId" TEXT NOT NULL,
    "guideId" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "meetingPoint" TEXT NOT NULL,
    "meetingTime" TEXT NOT NULL,
    "maxParticipants" INTEGER NOT NULL,
    "bookedSlots" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trip_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trip_guideId_fkey" FOREIGN KEY ("guideId") REFERENCES "Guide" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Stay" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "longDescription" TEXT,
    "image" TEXT NOT NULL,
    "gallery" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "coordinates" TEXT,
    "lat" REAL,
    "lng" REAL,
    "pricePerNight" REAL NOT NULL,
    "type" TEXT NOT NULL,
    "amenities" TEXT NOT NULL,
    "maxGuests" INTEGER NOT NULL,
    "rooms" INTEGER NOT NULL,
    "operatorId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "sourceType" TEXT NOT NULL DEFAULT 'MANUAL',
    "externalPlaceId" TEXT,
    "bookingPlaceId" TEXT,
    "serpPlaceId" TEXT,
    "rawMeta" TEXT,
    "lastSyncedAt" DATETIME,
    "rankingScore" REAL NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "priceFrom" REAL,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "affiliateMatchName" TEXT,
    "affiliateProvider" TEXT,
    "affiliateDeepLink" TEXT,
    "autoMatchEnabled" BOOLEAN NOT NULL DEFAULT true,
    "experienceTags" TEXT,
    "minNights" INTEGER NOT NULL DEFAULT 1,
    "maxNights" INTEGER NOT NULL DEFAULT 30,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Stay_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Restaurant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT,
    "longDescription" TEXT,
    "image" TEXT NOT NULL,
    "gallery" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "coordinates" TEXT,
    "lat" REAL,
    "lng" REAL,
    "type" TEXT NOT NULL DEFAULT 'RESTAURANT',
    "cuisine" TEXT NOT NULL,
    "cuisineTags" TEXT,
    "priceRange" TEXT NOT NULL,
    "priceLevel" INTEGER,
    "specialties" TEXT NOT NULL,
    "hours" TEXT NOT NULL,
    "opensAt" TEXT,
    "closesAt" TEXT,
    "openDays" TEXT,
    "operatingHoursJson" TEXT,
    "hoursVerified" BOOLEAN NOT NULL DEFAULT false,
    "isHalal" BOOLEAN NOT NULL DEFAULT false,
    "isVegetarianFriendly" BOOLEAN NOT NULL DEFAULT false,
    "sourceType" TEXT NOT NULL DEFAULT 'MANUAL',
    "googlePlaceId" TEXT,
    "serpPlaceId" TEXT,
    "rawMeta" TEXT,
    "rating" REAL NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "rankingScore" REAL NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "affiliateMatchName" TEXT,
    "primaryAffiliateProvider" TEXT,
    "foodpandaSlug" TEXT,
    "grabfoodSlug" TEXT,
    "shopeefoodSlug" TEXT,
    "affiliateDeepLink" TEXT,
    "autoMatchEnabled" BOOLEAN NOT NULL DEFAULT true,
    "operatorId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Restaurant_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Operator" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL DEFAULT 'OPERATOR',
    "commission" REAL NOT NULL DEFAULT 0.0,
    "whatsapp" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "sessionId" TEXT,
    "itemType" TEXT NOT NULL,
    "activityId" TEXT,
    "tripId" TEXT,
    "stayId" TEXT,
    "date" DATETIME NOT NULL,
    "endDate" DATETIME,
    "participants" INTEGER NOT NULL DEFAULT 1,
    "pricePerUnit" REAL NOT NULL,
    "totalPrice" REAL NOT NULL,
    "addOns" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "expiresAt" DATETIME,
    CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CartItem_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CartItem_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "CartItem_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "bookingType" TEXT NOT NULL,
    "activityId" TEXT,
    "tripId" TEXT,
    "stayId" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "participants" INTEGER NOT NULL DEFAULT 1,
    "totalAmount" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentStatus" TEXT NOT NULL DEFAULT 'PENDING',
    "paymentIntentId" TEXT,
    "customerDetails" TEXT NOT NULL,
    "specialRequests" TEXT,
    "addOns" TEXT,
    "confirmationCode" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Booking_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_tripId_fkey" FOREIGN KEY ("tripId") REFERENCES "Trip" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Booking_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "BookingParticipant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "age" INTEGER,
    "emergencyContact" TEXT,
    "emergencyPhone" TEXT,
    "specialNeeds" TEXT,
    "dietaryReqs" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingParticipant_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MYR',
    "provider" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingId" TEXT,
    "senderId" TEXT NOT NULL,
    "receiverType" TEXT NOT NULL,
    "receiverId" TEXT,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'USER_TO_OPERATOR',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "activityId" TEXT,
    "stayId" TEXT,
    "restaurantId" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "images" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Review_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Review_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Review_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Availability" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "operatorId" TEXT NOT NULL,
    "activityId" TEXT,
    "stayId" TEXT,
    "date" DATETIME NOT NULL,
    "slots" INTEGER NOT NULL,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Availability_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "Operator" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Availability_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Availability_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "bookingId" TEXT,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "sentAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PageContent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageSlug" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "isEncrypted" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Analytics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "event" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MapSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL DEFAULT 'osm',
    "defaultCenterLat" REAL NOT NULL DEFAULT 3.5410,
    "defaultCenterLng" REAL NOT NULL DEFAULT 101.6900,
    "defaultZoom" INTEGER NOT NULL DEFAULT 13,
    "tileProvider" TEXT NOT NULL DEFAULT 'OSM',
    "tileUrl" TEXT NOT NULL DEFAULT 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    "attribution" TEXT NOT NULL DEFAULT '© OpenStreetMap contributors',
    "geocodeProvider" TEXT NOT NULL DEFAULT 'nominatim',
    "geocodeApiKey" TEXT,
    "routingProvider" TEXT NOT NULL DEFAULT 'osrm',
    "routingApiKey" TEXT,
    "mapStyleJson" TEXT,
    "showOnNavbar" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MapPin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "lat" REAL NOT NULL,
    "lng" REAL NOT NULL,
    "address" TEXT,
    "linkType" TEXT NOT NULL DEFAULT 'none',
    "activityId" TEXT,
    "stayId" TEXT,
    "restaurantId" TEXT,
    "externalUrl" TEXT,
    "iconType" TEXT NOT NULL DEFAULT 'default',
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "serpPlaceId" TEXT,
    "thumbnail" TEXT,
    "rawMeta" TEXT,
    "sourceType" TEXT NOT NULL DEFAULT 'MANUAL',
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MapPin_activityId_fkey" FOREIGN KEY ("activityId") REFERENCES "Activity" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MapPin_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "MapPin_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TransportRoute" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "polyline" TEXT,
    "distance" REAL,
    "duration" REAL,
    "startLat" REAL NOT NULL,
    "startLng" REAL NOT NULL,
    "startName" TEXT,
    "endLat" REAL NOT NULL,
    "endLng" REAL NOT NULL,
    "endName" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'driving',
    "createdById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AffiliateProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "apiKeyConfigured" BOOLEAN NOT NULL DEFAULT false,
    "affiliateId" TEXT,
    "baseUrl" TEXT,
    "deepLinkPattern" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "lastStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "lastErrorMessage" TEXT,
    "lastCheckedAt" DATETIME,
    "description" TEXT,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "AffiliateMatchLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "stayId" TEXT,
    "restaurantId" TEXT,
    "affiliateProgramId" TEXT,
    "clickType" TEXT NOT NULL DEFAULT 'ACCOMMODATION',
    "clickedName" TEXT NOT NULL,
    "matchedName" TEXT,
    "generatedUrl" TEXT,
    "success" BOOLEAN NOT NULL DEFAULT false,
    "errorMessage" TEXT,
    "checkInDate" DATETIME,
    "checkOutDate" DATETIME,
    "guests" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AffiliateMatchLog_stayId_fkey" FOREIGN KEY ("stayId") REFERENCES "Stay" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AffiliateMatchLog_restaurantId_fkey" FOREIGN KEY ("restaurantId") REFERENCES "Restaurant" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AffiliateMatchLog_affiliateProgramId_fkey" FOREIGN KEY ("affiliateProgramId") REFERENCES "AffiliateProgram" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DataSyncStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceType" TEXT NOT NULL,
    "lastSyncAt" DATETIME,
    "lastStatus" TEXT NOT NULL DEFAULT 'NEVER',
    "lastErrorMessage" TEXT,
    "recordsUpdated" INTEGER NOT NULL DEFAULT 0,
    "recordsCreated" INTEGER NOT NULL DEFAULT 0,
    "nextScheduledAt" DATETIME,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SyncLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME,
    "duration" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "createdCount" INTEGER NOT NULL DEFAULT 0,
    "updatedCount" INTEGER NOT NULL DEFAULT 0,
    "skippedCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "errorDetails" TEXT,
    "summary" TEXT,
    "metadata" TEXT,
    "triggeredBy" TEXT NOT NULL DEFAULT 'CRON',
    "triggeredById" TEXT
);

-- CreateTable
CREATE TABLE "UserLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "resourceId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "oldValue" TEXT,
    "newValue" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SUCCESS',
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "company" TEXT,
    "companyLogo" TEXT,
    "commissionRate" REAL NOT NULL DEFAULT 0,
    "commissionType" TEXT NOT NULL DEFAULT 'PERCENTAGE',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" REAL NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0,
    "bankDetails" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT,
    "content" TEXT NOT NULL,
    "coverImage" TEXT,
    "images" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "tags" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "metaKeywords" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "authorId" TEXT,
    "authorName" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "content" TEXT,
    "coverImage" TEXT,
    "images" TEXT,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "startTime" TEXT,
    "endTime" TEXT,
    "isAllDay" BOOLEAN NOT NULL DEFAULT false,
    "location" TEXT NOT NULL,
    "venue" TEXT,
    "coordinates" TEXT,
    "category" TEXT NOT NULL DEFAULT 'community',
    "organizer" TEXT,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "websiteUrl" TEXT,
    "ticketUrl" TEXT,
    "isFree" BOOLEAN NOT NULL DEFAULT true,
    "priceRange" TEXT,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "HistorySection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "subtitle" TEXT,
    "content" TEXT NOT NULL,
    "excerpt" TEXT,
    "coverImage" TEXT,
    "images" TEXT,
    "era" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "metaTitle" TEXT,
    "metaDescription" TEXT,
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FAQ" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "subcategory" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "notHelpfulCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "filename" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "url" TEXT NOT NULL,
    "folder" TEXT NOT NULL DEFAULT '/',
    "category" TEXT NOT NULL DEFAULT 'general',
    "alt" TEXT,
    "caption" TEXT,
    "tags" TEXT,
    "width" INTEGER,
    "height" INTEGER,
    "uploadedById" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "IntegrationConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "category" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "apiKey" TEXT,
    "apiKeySource" TEXT NOT NULL DEFAULT 'ENV',
    "clientId" TEXT,
    "clientSecret" TEXT,
    "affiliateId" TEXT,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "tokenExpiresAt" DATETIME,
    "baseUrl" TEXT,
    "deepLinkPattern" TEXT,
    "webhookUrl" TEXT,
    "configJson" TEXT,
    "lastStatus" TEXT NOT NULL DEFAULT 'UNKNOWN',
    "lastErrorMessage" TEXT,
    "lastCheckedAt" DATETIME,
    "lastSyncAt" DATETIME,
    "lastSyncStatus" TEXT,
    "recordsSynced" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "documentationUrl" TEXT,
    "usedBy" TEXT,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScrapedSource" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "baseUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ScrapedItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "externalId" TEXT,
    "externalUrl" TEXT,
    "title" TEXT,
    "rawContent" TEXT,
    "metaJson" TEXT,
    "targetModel" TEXT,
    "targetRecordId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "reviewedBy" TEXT,
    "reviewedAt" DATETIME,
    "errorMessage" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScrapedItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "ScrapedSource" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IngestionJob" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "parameters" TEXT,
    "totalItems" INTEGER NOT NULL DEFAULT 0,
    "processedItems" INTEGER NOT NULL DEFAULT 0,
    "successCount" INTEGER NOT NULL DEFAULT 0,
    "errorCount" INTEGER NOT NULL DEFAULT 0,
    "resultSummary" TEXT,
    "errors" TEXT,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    "triggeredBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "encryptedValue" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "IntegrationLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "provider" TEXT NOT NULL,
    "operation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "totalFetched" INTEGER NOT NULL DEFAULT 0,
    "created" INTEGER NOT NULL DEFAULT 0,
    "updated" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "duration" INTEGER,
    "errorMessage" TEXT,
    "errorDetails" TEXT,
    "summary" TEXT,
    "metadata" TEXT,
    "triggeredBy" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Guide_userId_key" ON "Guide"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Activity_slug_key" ON "Activity"("slug");

-- CreateIndex
CREATE INDEX "Trip_activityId_startDate_idx" ON "Trip"("activityId", "startDate");

-- CreateIndex
CREATE INDEX "Trip_guideId_startDate_idx" ON "Trip"("guideId", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "Stay_slug_key" ON "Stay"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Stay_bookingPlaceId_key" ON "Stay"("bookingPlaceId");

-- CreateIndex
CREATE UNIQUE INDEX "Stay_serpPlaceId_key" ON "Stay"("serpPlaceId");

-- CreateIndex
CREATE INDEX "Stay_type_idx" ON "Stay"("type");

-- CreateIndex
CREATE INDEX "Stay_sourceType_idx" ON "Stay"("sourceType");

-- CreateIndex
CREATE INDEX "Stay_isFeatured_idx" ON "Stay"("isFeatured");

-- CreateIndex
CREATE INDEX "Stay_rankingScore_idx" ON "Stay"("rankingScore");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_slug_key" ON "Restaurant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Restaurant_serpPlaceId_key" ON "Restaurant"("serpPlaceId");

-- CreateIndex
CREATE INDEX "Restaurant_type_idx" ON "Restaurant"("type");

-- CreateIndex
CREATE INDEX "Restaurant_sourceType_idx" ON "Restaurant"("sourceType");

-- CreateIndex
CREATE INDEX "Restaurant_isFeatured_idx" ON "Restaurant"("isFeatured");

-- CreateIndex
CREATE INDEX "Restaurant_isHalal_idx" ON "Restaurant"("isHalal");

-- CreateIndex
CREATE INDEX "Restaurant_rankingScore_idx" ON "Restaurant"("rankingScore");

-- CreateIndex
CREATE UNIQUE INDEX "Operator_email_key" ON "Operator"("email");

-- CreateIndex
CREATE INDEX "CartItem_userId_idx" ON "CartItem"("userId");

-- CreateIndex
CREATE INDEX "CartItem_sessionId_idx" ON "CartItem"("sessionId");

-- CreateIndex
CREATE INDEX "CartItem_expiresAt_idx" ON "CartItem"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_confirmationCode_key" ON "Booking"("confirmationCode");

-- CreateIndex
CREATE INDEX "Booking_userId_createdAt_idx" ON "Booking"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Booking_confirmationCode_idx" ON "Booking"("confirmationCode");

-- CreateIndex
CREATE INDEX "Booking_status_paymentStatus_idx" ON "Booking"("status", "paymentStatus");

-- CreateIndex
CREATE INDEX "BookingParticipant_bookingId_idx" ON "BookingParticipant"("bookingId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_bookingId_key" ON "Payment"("bookingId");

-- CreateIndex
CREATE INDEX "Message_bookingId_idx" ON "Message"("bookingId");

-- CreateIndex
CREATE INDEX "Message_senderId_receiverId_idx" ON "Message"("senderId", "receiverId");

-- CreateIndex
CREATE INDEX "Message_read_createdAt_idx" ON "Message"("read", "createdAt");

-- CreateIndex
CREATE INDEX "Review_activityId_createdAt_idx" ON "Review"("activityId", "createdAt");

-- CreateIndex
CREATE INDEX "Review_stayId_createdAt_idx" ON "Review"("stayId", "createdAt");

-- CreateIndex
CREATE INDEX "Review_restaurantId_createdAt_idx" ON "Review"("restaurantId", "createdAt");

-- CreateIndex
CREATE INDEX "Availability_date_operatorId_idx" ON "Availability"("date", "operatorId");

-- CreateIndex
CREATE INDEX "Availability_activityId_date_idx" ON "Availability"("activityId", "date");

-- CreateIndex
CREATE INDEX "Availability_stayId_date_idx" ON "Availability"("stayId", "date");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_status_createdAt_idx" ON "Notification"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "PageContent_pageSlug_sectionId_key" ON "PageContent"("pageSlug", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "Analytics_event_createdAt_idx" ON "Analytics"("event", "createdAt");

-- CreateIndex
CREATE INDEX "Analytics_userId_createdAt_idx" ON "Analytics"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "MapPin_slug_key" ON "MapPin"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "MapPin_serpPlaceId_key" ON "MapPin"("serpPlaceId");

-- CreateIndex
CREATE INDEX "MapPin_category_idx" ON "MapPin"("category");

-- CreateIndex
CREATE INDEX "MapPin_isVisible_idx" ON "MapPin"("isVisible");

-- CreateIndex
CREATE INDEX "MapPin_public_idx" ON "MapPin"("public");

-- CreateIndex
CREATE INDEX "MapPin_sourceType_idx" ON "MapPin"("sourceType");

-- CreateIndex
CREATE UNIQUE INDEX "TransportRoute_slug_key" ON "TransportRoute"("slug");

-- CreateIndex
CREATE INDEX "TransportRoute_mode_idx" ON "TransportRoute"("mode");

-- CreateIndex
CREATE UNIQUE INDEX "AffiliateProgram_code_key" ON "AffiliateProgram"("code");

-- CreateIndex
CREATE INDEX "AffiliateProgram_type_idx" ON "AffiliateProgram"("type");

-- CreateIndex
CREATE INDEX "AffiliateProgram_active_idx" ON "AffiliateProgram"("active");

-- CreateIndex
CREATE INDEX "AffiliateProgram_lastStatus_idx" ON "AffiliateProgram"("lastStatus");

-- CreateIndex
CREATE INDEX "AffiliateMatchLog_stayId_idx" ON "AffiliateMatchLog"("stayId");

-- CreateIndex
CREATE INDEX "AffiliateMatchLog_restaurantId_idx" ON "AffiliateMatchLog"("restaurantId");

-- CreateIndex
CREATE INDEX "AffiliateMatchLog_affiliateProgramId_idx" ON "AffiliateMatchLog"("affiliateProgramId");

-- CreateIndex
CREATE INDEX "AffiliateMatchLog_clickType_idx" ON "AffiliateMatchLog"("clickType");

-- CreateIndex
CREATE INDEX "AffiliateMatchLog_success_idx" ON "AffiliateMatchLog"("success");

-- CreateIndex
CREATE INDEX "AffiliateMatchLog_createdAt_idx" ON "AffiliateMatchLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DataSyncStatus_sourceType_key" ON "DataSyncStatus"("sourceType");

-- CreateIndex
CREATE INDEX "SyncLog_provider_idx" ON "SyncLog"("provider");

-- CreateIndex
CREATE INDEX "SyncLog_type_idx" ON "SyncLog"("type");

-- CreateIndex
CREATE INDEX "SyncLog_status_idx" ON "SyncLog"("status");

-- CreateIndex
CREATE INDEX "SyncLog_startedAt_idx" ON "SyncLog"("startedAt");

-- CreateIndex
CREATE INDEX "UserLog_userId_idx" ON "UserLog"("userId");

-- CreateIndex
CREATE INDEX "UserLog_action_idx" ON "UserLog"("action");

-- CreateIndex
CREATE INDEX "UserLog_resource_idx" ON "UserLog"("resource");

-- CreateIndex
CREATE INDEX "UserLog_createdAt_idx" ON "UserLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_userId_key" ON "Agent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Agent_email_key" ON "Agent"("email");

-- CreateIndex
CREATE INDEX "Agent_email_idx" ON "Agent"("email");

-- CreateIndex
CREATE INDEX "Agent_verified_idx" ON "Agent"("verified");

-- CreateIndex
CREATE INDEX "Agent_active_idx" ON "Agent"("active");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_status_idx" ON "BlogPost"("status");

-- CreateIndex
CREATE INDEX "BlogPost_category_idx" ON "BlogPost"("category");

-- CreateIndex
CREATE INDEX "BlogPost_publishedAt_idx" ON "BlogPost"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_slug_idx" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_status_idx" ON "Event"("status");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "Event_category_idx" ON "Event"("category");

-- CreateIndex
CREATE UNIQUE INDEX "HistorySection_slug_key" ON "HistorySection"("slug");

-- CreateIndex
CREATE INDEX "HistorySection_slug_idx" ON "HistorySection"("slug");

-- CreateIndex
CREATE INDEX "HistorySection_status_idx" ON "HistorySection"("status");

-- CreateIndex
CREATE INDEX "HistorySection_displayOrder_idx" ON "HistorySection"("displayOrder");

-- CreateIndex
CREATE INDEX "FAQ_category_idx" ON "FAQ"("category");

-- CreateIndex
CREATE INDEX "FAQ_status_idx" ON "FAQ"("status");

-- CreateIndex
CREATE INDEX "FAQ_displayOrder_idx" ON "FAQ"("displayOrder");

-- CreateIndex
CREATE INDEX "MediaAsset_folder_idx" ON "MediaAsset"("folder");

-- CreateIndex
CREATE INDEX "MediaAsset_category_idx" ON "MediaAsset"("category");

-- CreateIndex
CREATE INDEX "MediaAsset_mimeType_idx" ON "MediaAsset"("mimeType");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationConfig_provider_key" ON "IntegrationConfig"("provider");

-- CreateIndex
CREATE INDEX "IntegrationConfig_category_idx" ON "IntegrationConfig"("category");

-- CreateIndex
CREATE INDEX "IntegrationConfig_type_idx" ON "IntegrationConfig"("type");

-- CreateIndex
CREATE INDEX "IntegrationConfig_isActive_idx" ON "IntegrationConfig"("isActive");

-- CreateIndex
CREATE INDEX "IntegrationConfig_lastStatus_idx" ON "IntegrationConfig"("lastStatus");

-- CreateIndex
CREATE INDEX "ScrapedSource_type_idx" ON "ScrapedSource"("type");

-- CreateIndex
CREATE INDEX "ScrapedSource_active_idx" ON "ScrapedSource"("active");

-- CreateIndex
CREATE INDEX "ScrapedItem_sourceId_idx" ON "ScrapedItem"("sourceId");

-- CreateIndex
CREATE INDEX "ScrapedItem_category_idx" ON "ScrapedItem"("category");

-- CreateIndex
CREATE INDEX "ScrapedItem_status_idx" ON "ScrapedItem"("status");

-- CreateIndex
CREATE INDEX "ScrapedItem_externalId_idx" ON "ScrapedItem"("externalId");

-- CreateIndex
CREATE INDEX "ScrapedItem_targetModel_idx" ON "ScrapedItem"("targetModel");

-- CreateIndex
CREATE INDEX "ScrapedItem_createdAt_idx" ON "ScrapedItem"("createdAt");

-- CreateIndex
CREATE INDEX "IngestionJob_type_idx" ON "IngestionJob"("type");

-- CreateIndex
CREATE INDEX "IngestionJob_status_idx" ON "IngestionJob"("status");

-- CreateIndex
CREATE INDEX "IngestionJob_createdAt_idx" ON "IngestionJob"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_name_key" ON "ApiKey"("name");

-- CreateIndex
CREATE INDEX "ApiKey_name_idx" ON "ApiKey"("name");

-- CreateIndex
CREATE INDEX "ApiKey_isActive_idx" ON "ApiKey"("isActive");

-- CreateIndex
CREATE INDEX "IntegrationLog_provider_idx" ON "IntegrationLog"("provider");

-- CreateIndex
CREATE INDEX "IntegrationLog_operation_idx" ON "IntegrationLog"("operation");

-- CreateIndex
CREATE INDEX "IntegrationLog_status_idx" ON "IntegrationLog"("status");

-- CreateIndex
CREATE INDEX "IntegrationLog_startedAt_idx" ON "IntegrationLog"("startedAt");
