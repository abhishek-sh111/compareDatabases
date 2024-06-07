# Database Migration Comparison Tool

## Introduction

Hello! This project contains a script to help identify issues in a recent database migration. The script compares data between a pre-migration PostgreSQL database and a post-migration PostgreSQL database to find missing, corrupted, and new records.

## Scenario

Imagine that your team recently performed a data migration from one database to another. One week after the migration it was discovered that there was a bug in the migration process and some records were unintentionally missed or altered. This tool will identify the missing, corrupted, and new records (since the migration) in the migrated dataset.

## Assumptions

1. Both databases have the same table structure and assumed each database has more than one table.
2. The primary key for each table is `id`.
3. If two records have the same primary key but different values in any shared column, they are considered corrupted.
4. Missing records are those present in the pre-migration database but not in the post-migration database.
5. New records are those present in the post-migration database but not in the pre-migration database.

## Getting Started

### Prerequisites

- Docker
- Node.js

### Setup

** 1. Clone the repository:**

   ```bash
   git clone https://github.com/abhishek-sh111/compareDatabases.git
   cd compareDatabases


## 2.. ** Start Docker Containers:

## Run the provided Docker images to start the pre-migration and post-migration PostgreSQL databases.


## Start the pre-migration database container
docker run -d --name pre-migration-db -p 5432:5432 guaranteedrate/homework-pre-migration:1607545060-a7085621

## Start the post-migration database container
docker run -d --name post-migration-db -p 5433:5432 guaranteedrate/homework-post-migration:1607545060-a7085621



## Usage
## 1. Install Dependencies:

## Ensure you are in the project directory and install the necessary Node.js dependencies:

npm install

## 2. Run the Comparison Script:

## Execute the script to compare the databases and generate the report:

node compareDatabases.js

## 3. View the Report: (Note: You can change the destination location accordingly..)

The script will output the differences to the console and save the report to a file named database_comparison_report.txt in the project directory.


## 4. Format of output

Output
The report will include:

Records that are missing in the post-migration database.
Records that are new in the post-migration database.
Records that are corrupted (differing data in shared columns).
