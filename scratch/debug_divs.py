
with open("src/pages/WorkerDashboard.tsx", "r", encoding="utf-8") as f:
    lines = f.readlines()

stack = []
for i, line in enumerate(lines):
    line_num = i + 1
    # Count <div and </div accurately
    import re
    opens = re.findall(r"<div", line)
    closes = re.findall(r"</div", line)
    
    for _ in opens:
        stack.append(line_num)
        # print(f"L{line_num}: OPEN (stack={len(stack)})")
    for _ in closes:
        if stack:
            # print(f"L{line_num}: CLOSE (stack={len(stack)-1}) matching L{stack.pop()}")
            stack.pop()
        else:
            print(f"L{line_num}: EXTRA CLOSE!")

print(f"Final stack size: {len(stack)}")
if stack:
    print(f"Unclosed divs opened at lines: {stack}")
