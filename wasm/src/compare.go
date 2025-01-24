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

// Profile represents a user profile with timestamps
type Profile struct {
	Username     string `json:"username"`
	ConnectedAt  int64  `json:"connectedAt"`
	UnfollowedAt int64  `json:"unfollowedAt,omitempty"`
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

	// Convert usernames to User structs
	followers := make([]User, len(followerUsernames))
	for i, username := range followerUsernames {
		followers[i] = User{Username: username}
	}

	followings := make([]User, len(followingUsernames))
	for i, username := range followingUsernames {
		followings[i] = User{Username: username}
	}

	// Use helper functions to compute relationships
	mutuals := FetchMutualFollowers(followings, followers)
	unfollowers := FetchUnfollowers(followings, followers)
	followbacks := FetchFollowbacks(followings, followers)

	// Extract usernames
	mutualUsernames := make([]string, len(mutuals))
	for i, user := range mutuals {
		mutualUsernames[i] = user.Username
	}

	unfollowerUsernames := make([]string, len(unfollowers))
	for i, user := range unfollowers {
		unfollowerUsernames[i] = user.Username
	}

	followbackUsernames := make([]string, len(followbacks))
	for i, user := range followbacks {
		followbackUsernames[i] = user.Username
	}

	// Create profile collections
	createProfiles := func(usernames []string, isUnfollower bool) []Profile {
		profiles := make([]Profile, 0, len(usernames))
		for _, username := range usernames {
			if profile, exists := profileMap[username]; exists {
				if isUnfollower {
					profile.UnfollowedAt = time.Now().UnixMilli()
				}
				profiles = append(profiles, profile)
			}
		}
		return profiles
	}

	mutualProfiles := createProfiles(mutualUsernames, false)
	unfollowerProfiles := createProfiles(unfollowerUsernames, true)
	followbackProfiles := createProfiles(followbackUsernames, false)

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
