## 1. Research & Data Organization
- [x] 1.1 Analyze binary format from sample presets
- [x] 1.2 Create data.json with byte mapping and parameter metadata
- [x] 1.3 Organize presets into categorized folders (amp/, mod/, delay/, reverb/, etc.)

## 2. Core Implementation
- [x] 2.1 Create preset data model class
- [x] 2.2 Implement binary parser (tkg -> dict)
- [x] 2.3 Implement binary writer (dict -> tkg)
- [x] 2.4 Implement YAML serializer
- [x] 2.5 Implement YAML deserializer

## 3. CLI Interface
- [x] 3.1 Create __main__.py with argparse CLI
- [x] 3.2 Add tkg2yaml command
- [x] 3.3 Add yaml2tkg command
- [x] 3.4 Add batch conversion support

## 4. Testing & Validation
- [x] 4.1 Test round-trip conversion (tkg -> yaml -> tkg)
- [x] 4.2 Validate against all sample presets (105/105 passed)
- [x] 4.3 Test edge cases (min/max values, all effect types)
