#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "usage: $0 <directory-with-.so-files>" >&2
  exit 1
fi

root="$1"
if [[ ! -d "$root" ]]; then
  echo "error: not a directory: $root" >&2
  exit 1
fi

status=0

while IFS= read -r -d '' so; do
  abi="$(basename "$(dirname "$so")")"
  name="$(basename "$so")"
  if [[ "$abi" != "arm64-v8a" && "$abi" != "x86_64" ]]; then
    continue
  fi

  min_align="$(
    objdump -p "$so" |
      awk '
        /^    LOAD / {
          for (i = 1; i <= NF; i++) {
            if ($i == "align") {
              split($(i + 1), a, /\*\*/);
              if (min == "" || a[2] + 0 < min) {
                min = a[2] + 0;
              }
            }
          }
        }
        END {
          if (min == "") {
            print "";
          } else {
            print min;
          }
        }
      '
  )"

  if [[ -z "$min_align" ]]; then
    echo "$abi/$name: unable to inspect ELF alignment" >&2
    status=1
    continue
  fi

  if [[ "$min_align" -lt 14 ]]; then
    printf '%s/%s: UNALIGNED (2**%s)\n' "$abi" "$name" "$min_align"
    status=1
  else
    printf '%s/%s: ALIGNED (2**%s)\n' "$abi" "$name" "$min_align"
  fi
done < <(find "$root" -type f -name '*.so' -print0)

exit "$status"
