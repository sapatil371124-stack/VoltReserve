import os
import glob
import re

frontend_src = r"frontend\src"

files = glob.glob(os.path.join(frontend_src, "**", "*.jsx"), recursive=True)
count = 0

for fpath in files:
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()

    if "font-serif" in content:
        # Replace 'font-serif ' or ' font-serif' with ''
        new_content = re.sub(r'\bfont-serif\s*', '', content)
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(new_content)
        count += 1
        print(f"Cleaned font-serif in: {fpath}")

print(f"Finished replacing font-serif in {count} files.")
