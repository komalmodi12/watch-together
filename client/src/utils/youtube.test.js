import { extractVideoId } from "./youtube";

const ID = "dQw4w9WgXcQ";

describe("extractVideoId", () => {
  test.each([
    [`https://www.youtube.com/watch?v=${ID}`],
    [`https://youtube.com/watch?v=${ID}&t=42s`],
    [`https://www.youtube.com/watch?feature=share&v=${ID}`],
    [`https://youtu.be/${ID}`],
    [`https://youtu.be/${ID}?si=abc123`],
    [`https://www.youtube.com/embed/${ID}`],
    [`https://www.youtube.com/shorts/${ID}`],
    [`https://m.youtube.com/watch?v=${ID}`],
    [`youtube.com/watch?v=${ID}`],
    [`  https://youtu.be/${ID}  `],
    [ID],
  ])("extracts the id from %s", (input) => {
    expect(extractVideoId(input)).toBe(ID);
  });

  test.each([
    [""],
    ["hello"],
    ["https://google.com"],
    ["https://www.youtube.com/watch"],
    ["https://www.youtube.com/watch?v=short"],
    [`https://evil.com/watch?v=${ID}`],
    [null],
    [undefined],
    [123],
  ])("returns null for %s", (input) => {
    expect(extractVideoId(input)).toBeNull();
  });
});