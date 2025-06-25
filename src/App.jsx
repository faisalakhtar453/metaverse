import { useEffect, useState } from "react";
import { ethers, parseUnits } from "ethers";
import contractABI from "./abi.json";
import ThreeScene from "./components/ThreeScene";
const contractAddress = "0x3284C53B6F151B418849671D967be11FD6093495";

function App() {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [objects, setObjects] = useState([]);
  const [form, setForm] = useState({
    name: '',
    w: 1,
    h: 1,
    d: 1,
    x: 0,
    y: 0,
    z: 0,
  });

  const init = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const metaverseContract = new ethers.Contract(contractAddress, contractABI, signer);

        setAccount(address);
        setContract(metaverseContract);
      } catch (err) {
        console.error("Connection error:", err);
      }
    } else {
      console.error("MetaMask not detected");
    }
  };

  useEffect(() => {
    init();
  }, []);

  const fetchAllObjects = async () => {
    const objs = await contract.getObjects();
    setObjects(objs.map(o => ({
      name: o.name,
      w: Number(o.w),
      h: Number(o.h),
      d: Number(o.d),
      x: Number(o.x),
      y: Number(o.y),
      z: Number(o.z),
    })));
  };

  const mintObject = async () => {
    if (!contract) {
      alert("Contract not loaded yet.");
      return;
    }
    const { name, w, h, d, x, y, z } = form;
    console.log("Minting object with:", { name, w, h, d, x, y, z });

    try {
      const tx = await contract.mint(name, w, h, d, x, y, z, {
        value: parseUnits("1", "wei"),
      });
      await tx.wait();
      fetchAllObjects();
    } catch (err) {
      alert("Mint failed: " + err.message);
      console.error("Mint error:", err);
    }
  };


  const handleChange = e => {
    setForm(prev => ({
      ...prev,
      [e.target.name]: parseInt(e.target.value) || 0
    }));
  };

  return (
    <div className="app">
      <header>
        <h1>🧱 Metaverse NFT Viewer</h1>
        <p><strong>Connected as:</strong> {account || "Not connected"}</p>
      </header>

      <section className="mint-section">
        <h2>Mint New 3D Object</h2>
        <div className="form-grid">
          <input type="text" name="name" placeholder="Name" onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input type="number" name="w" placeholder="Width" onChange={handleChange} />
          <input type="number" name="h" placeholder="Height" onChange={handleChange} />
          <input type="number" name="d" placeholder="Depth" onChange={handleChange} />
          <input type="number" name="x" placeholder="X" onChange={handleChange} />
          <input type="number" name="y" placeholder="Y" onChange={handleChange} />
          <input type="number" name="z" placeholder="Z" onChange={handleChange} />
        </div>
        <button className="mint-button" onClick={mintObject}>Mint Object</button>
      </section>

      <section className="scene-section">
        <h2>3D Scene Viewer</h2>
        <button className="load-button" onClick={fetchAllObjects}>Load Objects</button>
        <ThreeScene objects={objects} />
      </section>
    </div>
  );
}

export default App;
