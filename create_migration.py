import argparse
import os, sys, time
folder = "./src/migrations/company_db"

# parse and get arguments
parser = argparse.ArgumentParser(description='Create a new migration file')
parser.add_argument('name', type=str, help='Name of the migration file')
args = parser.parse_args()

# create migration file
file_name = "{}_{}.ts".format(int(time.time()), args.name)
file_path = os.path.join(folder, file_name)
content = """

export default async function up(conn: any) {
    //return await conn.query(``);
}

export async function down(conn: any) {
    //return conn.query(``);
}
"""

with open(file_path, 'w') as f:
    f.write(content)

# Usage: python create_migration.py create_users_table