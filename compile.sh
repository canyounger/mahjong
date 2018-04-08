clear

# (第0步) 路径配置 (TS_BIN_PATH是编译的JS文件保存在哪里, JS_REF_PATH是Creator的脚本源文件目录)
# TS_BIN_PATH="./export"
JS_REF_PATH="../../"

# (第1步) 编译 TypeScript 至 JavaScript ------------------------------------------------------ 翻译TS文件, 生成相应的JS代码到TS_BIN_PATH的位置
echo ""
echo "compile TypeScript to JavaScript ..."
time tsc --project src

# (第2步) 修正TypeScript与CocosCreator的require差异 ------------------------------------------ 服务器基于NodeJS的工程不需要此修正
# echo "fix require(path to name) ..."
# sed -i '' -e 's/require("[^\"]*\//require("/g' $(find TSExports -name "*.js" -type f)

# (第3步) 同步文件至CocosCreator的脚本目录 ---------------------------------------------------- JS文件同步, 服务器的同学可以改前面的JS_REF_PATH的路径到你们工程的相应位置
echo "copy  files to project ..." "${TS_BIN_PATH}" "${JS_REF_PATH}"
# time rsync -rR -aE --exclude="*.d.ts *.json" "${TS_BIN_PATH}" "${JS_REF_PATH}"
rm -r "${TS_BIN_PATH}"
# 完成 --------------------------------------------------------------------------------------
echo "- completed -"
date '+%F  %X'
echo ""