# About Mantine Vendor Components

These files are copied from the Mantine GitHub repository so that we can extend/customize them further. This is especially useful for <Select> components which need to be heavily customized and a lot of props, which - preferably - we shouldn't recreate from scratch, but this approach comes with several limitations:

- Any updates/bug fixes to Mantine is not automatically applied to these files
- Styling issues. We cannot use the .module.css files in the Mantine repository directly since they use CSS preprocessors to compile their code (and we don't); and we cannot directly use the files in @mantine/core/styles because the names have been obfuscated, which means calling "classes.optionsDropdown" doesn't work because .optionsDropdown had been obfuscated with a name like .m325325.

This means that the obfuscated class names has to be hard-coded using the names in @mantine/core/styles. **This will cause issues when upgrading Mantine**. Whenever you update Mantine, check the class names in @mantine/core/styles, find its original CSS class in the Mantine repository, and then fix the hard-coded class names.
