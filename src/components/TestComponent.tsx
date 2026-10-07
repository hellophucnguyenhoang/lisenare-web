export default function TestComponent() {
  function handleClick() {
    const a = {};
    if (a) {
      console.log("True");
    } else {
      console.log("False");
    }
  }

  return <button onClick={() => handleClick()}>Run</button>;
}
