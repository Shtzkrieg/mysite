-- CreateTable
CREATE TABLE "WorkItem" (
    "id" SERIAL NOT NULL,
    "company" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "website" TEXT,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "summary" TEXT,
    "thumbnail_url" TEXT,

    CONSTRAINT "WorkItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Highlight" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "workItemId" INTEGER NOT NULL,

    CONSTRAINT "Highlight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EducationItem" (
    "id" SERIAL NOT NULL,
    "institution" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "studyType" TEXT NOT NULL,
    "startDate" TEXT NOT NULL,
    "endDate" TEXT,
    "gpa" TEXT,

    CONSTRAINT "EducationItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Course" (
    "id" SERIAL NOT NULL,
    "educationItemId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "Course_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkItem_company_position_startDate_key" ON "WorkItem"("company", "position", "startDate");

-- CreateIndex
CREATE UNIQUE INDEX "EducationItem_institution_area_studyType_startDate_key" ON "EducationItem"("institution", "area", "studyType", "startDate");

-- AddForeignKey
ALTER TABLE "Highlight" ADD CONSTRAINT "Highlight_workItemId_fkey" FOREIGN KEY ("workItemId") REFERENCES "WorkItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Course" ADD CONSTRAINT "Course_educationItemId_fkey" FOREIGN KEY ("educationItemId") REFERENCES "EducationItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
