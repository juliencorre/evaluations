from pathlib import Path

path = Path("src/views/AuthView.vue")
text = path.read_text(encoding="utf-8")

new_template = """<template>
