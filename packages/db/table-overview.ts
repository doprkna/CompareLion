import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface TableInfo {
  name: string;
  count: number;
  hasRecords: boolean;
}

async function getTableOverview() {
  console.log("📊 PRISMA TABLES OVERVIEW\n");
  console.log("=" .repeat(60));
  
  try {
    // Get all model names from Prisma client
    const modelNames = Object.keys(prisma).filter(key => 
      typeof (prisma as any)[key] === 'object' && 
      (prisma as any)[key].count && 
      !key.startsWith('_') && 
      !key.startsWith('$')
    );
    
    const tableInfos: TableInfo[] = [];
    
    for (const modelName of modelNames) {
      const capitalizedName = modelName.charAt(0).toUpperCase() + modelName.slice(1);
      
      try {
        // Try to get count for this model
        const count = await (prisma as any)[modelName].count();
        tableInfos.push({
          name: capitalizedName,
          count,
          hasRecords: count > 0
        });
      } catch (error) {
        // If count fails, try to get first record to check if table exists
        try {
          await (prisma as any)[modelName].findFirst();
          tableInfos.push({
            name: capitalizedName,
            count: -1, // -1 means we couldn't get count but table exists
            hasRecords: true
          });
        } catch {
          tableInfos.push({
            name: capitalizedName,
            count: 0,
            hasRecords: false
          });
        }
      }
    }
    
    // Sort by count (descending) then by name
    tableInfos.sort((a, b) => {
      if (a.count === b.count) return a.name.localeCompare(b.name);
      if (a.count === -1) return 1;
      if (b.count === -1) return -1;
      return b.count - a.count;
    });
    
    // Display results
    console.log("📋 TABLE RECORD COUNTS:\n");
    
    let totalRecords = 0;
    let tablesWithRecords = 0;
    
    for (const table of tableInfos) {
      const countStr = table.count === -1 ? "?" : table.count.toString();
      const status = table.hasRecords ? "✅" : "❌";
      const padding = " ".repeat(Math.max(0, 30 - table.name.length));
      
      console.log(`${status} ${table.name}${padding} ${countStr.padStart(6)} records`);
      
      if (table.count > 0) {
        totalRecords += table.count;
        tablesWithRecords++;
      }
    }
    
    console.log("\n" + "=" .repeat(60));
    console.log(`📈 SUMMARY:`);
    console.log(`   Total Tables: ${tableInfos.length}`);
    console.log(`   Tables with Records: ${tablesWithRecords}`);
    console.log(`   Total Records: ${totalRecords}`);
    
    // Show tables with most records
    const topTables = tableInfos
      .filter(t => t.count > 0)
      .slice(0, 10);
    
    if (topTables.length > 0) {
      console.log(`\n🏆 TOP TABLES BY RECORD COUNT:`);
      topTables.forEach((table, index) => {
        console.log(`   ${index + 1}. ${table.name}: ${table.count} records`);
      });
    }
    
    // Show empty tables
    const emptyTables = tableInfos.filter(t => t.count === 0);
    if (emptyTables.length > 0) {
      console.log(`\n📭 EMPTY TABLES (${emptyTables.length}):`);
      emptyTables.forEach(table => {
        console.log(`   • ${table.name}`);
      });
    }
    
  } catch (error) {
    console.error("❌ Error generating table overview:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the overview
getTableOverview().catch(console.error);
