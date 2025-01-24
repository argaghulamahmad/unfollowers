package main

import (
	"encoding/json"
	"syscall/js"
	"time"
)

// User represents a social media user
type User struct {
	Username string
}

// FetchMutualFollowers returns a list of mutual followers
func FetchMutualFollowers(followings, followers []User) []User {
	mutual := []User{}
	followersMap := make(map[string]bool)

	// Store followers in a map
	for _, user := range followings {
		followersMap[user.Username] = true
	}

	// Check if followers are in the followings
	for _, user := range followers {
		if followersMap[user.Username] {
			mutual = append(mutual, user)
		}
	}
	return mutual
}

// FetchUnfollowers returns a list of unfollowers
func FetchUnfollowers(followings, followers []User) []User {
	unfollowers := []User{}
	followersMap := make(map[string]bool)

	// Store followers in a map
	for _, user := range followers {
		followersMap[user.Username] = true
	}

	// Check if followings are not in the followers
	for _, user := range followings {
		if !followersMap[user.Username] {
			unfollowers = append(unfollowers, user)
		}
	}
	return unfollowers
}

// FetchFollowbacks returns a list of followbacks
func FetchFollowbacks(followings, followers []User) []User {
	followbacks := []User{}
	followersMap := make(map[string]bool)

	// Store followings in a map
	for _, user := range followings {
		followersMap[user.Username] = true
	}

	// Check if followers are in the followings
	for _, user := range followers {
		if followersMap[user.Username] {
			followbacks = append(followbacks, user)
		}
	}
	return followbacks
}

type Profile struct {
	Username    string `json:"username"`
	ConnectedAt int64  `json:"connectedAt"`
}

type ProcessedData struct {
	AllProfiles              []Profile `json:"allProfiles"`
	AllProfilesTotal         int       `json:"allProfilesTotal"`
	FollowbackUsernames      []string  `json:"followbackUsernames"`
	UnfollowerUsernames      []string  `json:"unfollowerUsernames"`
	MutualUsernames          []string  `json:"mutualUsernames"`
	FollowbackProfiles       []Profile `json:"followbackProfiles"`
	FollowbacksProfilesTotal int       `json:"followbacksProfilesTotal"`
	UnfollowerProfiles       []Profile `json:"unfollowerProfiles"`
	UnfollowersProfilesTotal int       `json:"unfollowersProfilesTotal"`
	MutualProfiles           []Profile `json:"mutualProfiles"`
	MutualProfilesTotal      int       `json:"mutualProfilesTotal"`
	LastUpdateAt             int64     `json:"lastUpdateAt"`
}

func processProfiles(this js.Value, args []js.Value) interface{} {
	if len(args) != 3 {
		return js.ValueOf(map[string]interface{}{
			"error": "Invalid number of arguments",
		})
	}

	// Parse input data
	var allProfiles []Profile
	var followerUsernames []string
	var followingUsernames []string

	if err := json.Unmarshal([]byte(args[0].String()), &allProfiles); err != nil {
		return js.ValueOf(map[string]interface{}{
			"error": "Failed to parse allProfiles: " + err.Error(),
		})
	}
	if err := json.Unmarshal([]byte(args[1].String()), &followerUsernames); err != nil {
		return js.ValueOf(map[string]interface{}{
			"error": "Failed to parse followerUsernames: " + err.Error(),
		})
	}
	if err := json.Unmarshal([]byte(args[2].String()), &followingUsernames); err != nil {
		return js.ValueOf(map[string]interface{}{
			"error": "Failed to parse followingUsernames: " + err.Error(),
		})
	}

	// Create profile lookup map
	profileMap := make(map[string]Profile)
	for _, profile := range allProfiles {
		profileMap[profile.Username] = profile
	}

	// Create sets for O(1) lookups
	followerSet := make(map[string]bool)
	followingSet := make(map[string]bool)
	for _, username := range followerUsernames {
		followerSet[username] = true
	}
	for _, username := range followingUsernames {
		followingSet[username] = true
	}

	// Compute relationships
	var followbackUsernames []string
	var unfollowerUsernames []string
	var mutualUsernames []string

	for username := range followerSet {
		if !followingSet[username] {
			followbackUsernames = append(followbackUsernames, username)
		}
	}
	for username := range followingSet {
		if !followerSet[username] {
			unfollowerUsernames = append(unfollowerUsernames, username)
		} else {
			mutualUsernames = append(mutualUsernames, username)
		}
	}

	// Create profile collections
	createProfiles := func(usernames []string) []Profile {
		profiles := make([]Profile, 0, len(usernames))
		for _, username := range usernames {
			if profile, exists := profileMap[username]; exists {
				profiles = append(profiles, profile)
			}
		}
		return profiles
	}

	followbackProfiles := createProfiles(followbackUsernames)
	unfollowerProfiles := createProfiles(unfollowerUsernames)
	mutualProfiles := createProfiles(mutualUsernames)

	// Prepare result
	result := ProcessedData{
		AllProfiles:              allProfiles,
		AllProfilesTotal:         len(allProfiles),
		FollowbackUsernames:      followbackUsernames,
		UnfollowerUsernames:      unfollowerUsernames,
		MutualUsernames:          mutualUsernames,
		FollowbackProfiles:       followbackProfiles,
		FollowbacksProfilesTotal: len(followbackProfiles),
		UnfollowerProfiles:       unfollowerProfiles,
		UnfollowersProfilesTotal: len(unfollowerProfiles),
		MutualProfiles:           mutualProfiles,
		MutualProfilesTotal:      len(mutualProfiles),
		LastUpdateAt:             time.Now().UnixMilli(),
	}

	// Convert to JSON
	jsonResult, err := json.Marshal(result)
	if err != nil {
		return js.ValueOf(map[string]interface{}{
			"error": "Failed to marshal result: " + err.Error(),
		})
	}

	return js.ValueOf(string(jsonResult))
}

func main() {
	c := make(chan struct{})
	js.Global().Set("processProfiles", js.FuncOf(processProfiles))
	<-c
}
