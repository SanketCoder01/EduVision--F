# Database Management Systems Knowledge Base - 10 Q&A pairs

DBMS_QA = [
    {
        "question": "What is database normalization and why is it important?",
        "answer": "**Database Normalization** eliminates redundancy and ensures data integrity through normal forms:\n\n**1NF (First Normal Form):**\n• Atomic values only (no repeating groups)\n• Each cell contains single value\n\n**2NF (Second Normal Form):**\n• Must be in 1NF\n• No partial dependencies on composite keys\n\n**3NF (Third Normal Form):**\n• Must be in 2NF\n• No transitive dependencies\n\n**Benefits:** Reduces storage, prevents anomalies, ensures consistency\n**Trade-off:** May require joins for queries"
    },
    {
        "question": "Explain ACID properties in databases",
        "answer": "**ACID Properties ensure database reliability:**\n\n**Atomicity:**\n• All operations in transaction succeed or all fail\n• No partial updates\n• Example: Bank transfer - both debit and credit must happen\n\n**Consistency:**\n• Database remains in valid state\n• All constraints satisfied\n• Example: Account balance never negative\n\n**Isolation:**\n• Concurrent transactions don't interfere\n• Each transaction sees consistent snapshot\n• Levels: Read Uncommitted, Read Committed, Repeatable Read, Serializable\n\n**Durability:**\n• Committed changes survive system failures\n• Data persisted to non-volatile storage"
    },
    {
        "question": "What are the different types of SQL joins?",
        "answer": "**SQL Join Types:**\n\n**1. INNER JOIN:**\n• Returns matching records from both tables\n• Most common join type\n\n**2. LEFT JOIN (LEFT OUTER):**\n• All records from left table + matching from right\n• NULL for non-matching right records\n\n**3. RIGHT JOIN (RIGHT OUTER):**\n• All records from right table + matching from left\n• NULL for non-matching left records\n\n**4. FULL OUTER JOIN:**\n• All records from both tables\n• NULL where no match\n\n**5. CROSS JOIN:**\n• Cartesian product of both tables\n• Every row from table1 × every row from table2"
    },
    {
        "question": "How do database indexes work and when should you use them?",
        "answer": "**Database Indexes** are data structures that improve query performance:\n\n**How they work:**\n• Create sorted pointers to actual data\n• Like book index - points to page numbers\n• Common types: B-tree, Hash, Bitmap\n\n**When to use:**\n✅ Frequently queried columns\n✅ WHERE clause conditions\n✅ JOIN conditions\n✅ ORDER BY columns\n\n**When NOT to use:**\n❌ Frequently updated columns\n❌ Small tables\n❌ Columns with low selectivity\n\n**Trade-off:** Faster reads vs slower writes + extra storage"
    },
    {
        "question": "What is the difference between DELETE, TRUNCATE, and DROP?",
        "answer": "**DELETE vs TRUNCATE vs DROP:**\n\n**DELETE:**\n• Removes specific rows based on WHERE condition\n• Can be rolled back (if in transaction)\n• Triggers fire\n• Slower for large datasets\n• Logs each deleted row\n\n**TRUNCATE:**\n• Removes ALL rows from table\n• Cannot be rolled back\n• Triggers don't fire\n• Faster than DELETE\n• Minimal logging\n• Resets identity counters\n\n**DROP:**\n• Removes entire table structure and data\n• Cannot be rolled back\n• Frees up storage space completely\n• Table no longer exists"
    },
    {
        "question": "Explain database transaction isolation levels",
        "answer": "**Transaction Isolation Levels:**\n\n**1. READ UNCOMMITTED:**\n• Lowest isolation\n• Can read uncommitted changes (dirty reads)\n• Fastest but least safe\n\n**2. READ COMMITTED:**\n• Default in most databases\n• Only reads committed data\n• Prevents dirty reads\n• May have non-repeatable reads\n\n**3. REPEATABLE READ:**\n• Same data read multiple times in transaction\n• Prevents dirty and non-repeatable reads\n• May have phantom reads\n\n**4. SERIALIZABLE:**\n• Highest isolation\n• Complete isolation from other transactions\n• Prevents all anomalies\n• Slowest performance"
    },
    {
        "question": "What are stored procedures and their advantages?",
        "answer": "**Stored Procedures** are precompiled SQL code blocks stored in database:\n\n**Advantages:**\n• **Performance:** Precompiled and cached\n• **Security:** Reduce SQL injection risk\n• **Reusability:** Called from multiple applications\n• **Network Traffic:** Less data transfer\n• **Business Logic:** Centralized in database\n• **Maintenance:** Single point of change\n\n**Disadvantages:**\n• **Portability:** Database-specific\n• **Version Control:** Harder to manage\n• **Debugging:** Limited tools\n• **Scalability:** Database becomes bottleneck\n\n**Best for:** Complex business logic, data validation, batch operations"
    },
    {
        "question": "How do primary keys and foreign keys work?",
        "answer": "**Primary Key:**\n• Uniquely identifies each record\n• Cannot be NULL\n• Only one per table\n• Automatically creates unique index\n• Examples: StudentID, OrderID\n\n**Foreign Key:**\n• References primary key of another table\n• Maintains referential integrity\n• Can be NULL (unless specified otherwise)\n• Multiple foreign keys allowed per table\n• Prevents orphaned records\n\n**Referential Integrity Actions:**\n• CASCADE: Delete/update related records\n• SET NULL: Set foreign key to NULL\n• RESTRICT: Prevent deletion if references exist\n• SET DEFAULT: Set to default value"
    },
    {
        "question": "What is the difference between clustered and non-clustered indexes?",
        "answer": "**Clustered Index:**\n• Physical order of data matches index order\n• Data pages stored in order of key values\n• Only ONE per table\n• Faster for range queries\n• Primary key creates clustered index by default\n• Leaf level contains actual data\n\n**Non-Clustered Index:**\n• Logical order separate from physical storage\n• Multiple allowed per table (up to 999 in SQL Server)\n• Faster for specific value lookups\n• Leaf level contains pointers to data\n• Additional storage overhead\n\n**Analogy:** Clustered = Dictionary (alphabetical), Non-clustered = Book index (points to pages)"
    },
    {
        "question": "Explain database backup and recovery strategies",
        "answer": "**Database Backup Types:**\n\n**1. Full Backup:**\n• Complete copy of entire database\n• Longest time, most storage\n• Foundation for other backup types\n\n**2. Incremental Backup:**\n• Only changes since last backup\n• Fastest, least storage\n• Requires chain of backups for restore\n\n**3. Differential Backup:**\n• Changes since last full backup\n• Medium time and storage\n• Only needs full + latest differential\n\n**Recovery Strategies:**\n• **Point-in-time recovery:** Restore to specific moment\n• **Log shipping:** Continuous backup of transaction logs\n• **Mirroring:** Real-time copy to another server\n• **Clustering:** Multiple servers sharing storage"
    }
]
