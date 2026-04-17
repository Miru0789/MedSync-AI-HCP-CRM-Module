import sqlite3

try:
    conn = sqlite3.connect('hcp_crm.db')
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE interactions ADD COLUMN facility VARCHAR(255)")
        print("Column 'facility' added successfully.")
    except Exception as e:
        pass
    try:
        cursor.execute("ALTER TABLE interactions ADD COLUMN interaction_date DATETIME")
        print("Column 'interaction_date' added successfully.")
    except Exception as e:
        pass
    conn.commit()
except sqlite3.OperationalError as e:
    print(f"OperationalError: {e}")
except Exception as e:
    print(f"Error: {e}")
finally:
    conn.close()
