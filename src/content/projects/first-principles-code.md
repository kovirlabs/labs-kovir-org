---
name: First Principles Code
repo: kovirlabs/first-principles-code
tagline: A teaching template that shows engineers how to solve real problems in open-source Python.
audience: Engineering educators, students, and teams moving off expensive proprietary tools.
support: lab
status: stable
order: 40
category: education
platforms: [python]
---

First Principles Code is a template Python project that teaches engineers to solve real
engineering problems in Python. It shows that the open-source scientific stack, `numpy`, `scipy`
and friends, can replace expensive proprietary tools.

It includes a worked example that calculates displacement three different ways, and one documented
class per engineering domain. The domains are dynamics, statics, thermodynamics, fluids, materials,
gears, electrical, mechatronics, vibration and controls. There is also a unit-aware beam model
built on Pint.

Every method uses keyword-only arguments and carries a docstring, so the code doubles as a
reference you can read and learn from. A pytest suite runs out of the box.
