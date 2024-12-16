package main

import (
	"fmt"
	"os"

	"github.com/consensys/gnark-crypto/ecc"
	"github.com/consensys/gnark/backend/groth16"
	"github.com/consensys/gnark/frontend"
	"github.com/consensys/gnark/frontend/cs/r1cs"
)

type BattleTicketCircuit struct {
	UserAddress  frontend.Variable `gnark:"userAddress"`
	TokenAddress frontend.Variable `gnark:"tokenAddress"`
	NumTokens    frontend.Variable `gnark:"numTokens"`
	Ticket       frontend.Variable `gnark:",public"`
}

func (circuit *BattleTicketCircuit) Define(api frontend.API) error {
	api.AssertIsEqual(circuit.Ticket, api.Div(circuit.NumTokens, 10))
	return nil
}

func generateProof(userAddress string, tokenAddress string, tokenBalance int) (groth16.Proof, error) {
	var circuit BattleTicketCircuit
	ccs, _ := frontend.Compile(ecc.BN254.ScalarField(), r1cs.NewBuilder, &circuit)

	pk, vk, _ := groth16.Setup(ccs)
	userAddr := frontend.Variable(userAddress)
	tokenAddr := frontend.Variable(tokenAddress)

	assignment := BattleTicketCircuit{
		UserAddress:  userAddr,
		TokenAddress: tokenAddr,
		NumTokens:    tokenBalance,
		Ticket:       tokenBalance / 10,
	}
	witness, _ := frontend.NewWitness(&assignment, ecc.BN254.ScalarField())

	proof, _ := groth16.Prove(ccs, pk, witness)
	file, err := os.Create("battle_ticket_verifier.sol")
	if err != nil {
	}
	defer file.Close()

	err = vk.ExportSolidity(file)
	if err != nil {
	}
	return proof, nil
}

func main() {
	proof, err := generateProof("0x35134987bB541607Cd45e62Dd1feA4F587607817", "0x35134987bB541607Cd45e62Dd1feA4F587607817", 30)
	if err != nil {
	}
	fmt.Println(proof)
}
